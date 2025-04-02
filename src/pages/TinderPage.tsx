import { useEffect, useState } from 'react';
import { Spin, Typography, message } from 'antd';
import { DateCardType, SwipeSessionType } from '../types/dateCards';
import {
  createSwipeSession,
  getActiveCoupleCards,
  getActiveSwipeSession,
  getDateCard,
  getUserCouples,
  getLatestSwipeSession,
  markUserCompletedSwipes,
  subscribeToSession,
  updateUserSwipes,
  findAndUpdateMatches,
  createJointEvent
} from '../api/firebase/firebase';
import { WaitingScreen } from '../components/WaitingScreen';
import { TinderCard } from '../components/TinderCard';
import { findAvailableSlot } from '../utils/findAvailableSlot';

const { Title, Text } = Typography;

type CardWithNumericId = DateCardType & {
  numericId: number;
  originalId: string;
};

const containerStyle: React.CSSProperties = {
  position: 'relative',
  height: '600px',
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
};

const COMPLETED_STATUSES = ['completedSuccessfully', 'noMatchesFound'];
// const COMPLETED_STATUSES = ['matchesFound', 'completedSuccessfully', 'noMatchesFound'];


export const TinderPage = () => {
  const [cards, setCards] = useState<CardWithNumericId[]>([]);
  const [currentSession, setCurrentSession] = useState<SwipeSessionType | null>(null);
  const [loading, setLoading] = useState(true);
  const [partnerCompleted, setPartnerCompleted] = useState(false);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [coupleId, setCoupleId] = useState<string>('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const authUser = localStorage.getItem('authUser');
        if (!authUser) {
          setLoading(false);
          return;
        }

        const { id: userId } = JSON.parse(authUser);
        if (!userId) {
          setLoading(false);
          return;
        }

        const couples = await getUserCouples(userId);
        if (!couples.length) {
          setLoading(false);
          return;
        }

        const currentCouple = couples[0];
        const currentPartnerId = currentCouple.usersId.find(id => id !== userId) ?? null;
        setPartnerId(currentPartnerId);
        setCoupleId(currentCouple.id);

        //получаем последнюю сессию (не только активную)
        const latestSession = await getLatestSwipeSession(currentCouple.id);
        
        if (latestSession) {
          setCurrentSession(latestSession);
          
          //сессия в завершенном статусе - показываем экран ожидания
          if (COMPLETED_STATUSES.includes(latestSession.status)) {
            setLoading(false);
            return;
          }
          
          //сессия active - загружаем только не свайпнутые карточки
          if (latestSession.status === 'active') {
            const activeCards = await getActiveCoupleCards(currentCouple.id);
            if (!activeCards?.cardIds.length) {
              message.warning('No active cards available');
              setLoading(false);
              return;
            }

            //фильтрация
            const userSwipes = latestSession.swipes[userId] || {};
            const swipedCardIds = [
              ...(userSwipes.chosenActiveCards || []),
              ...(userSwipes.declinedActiveCards || [])
            ];

            const unswipedCardIds = activeCards.cardIds.filter(id => !swipedCardIds.includes(id));

            if (unswipedCardIds.length === 0) {
              //если не осталось карточек для свайпа, отмечаем пользователя как завершившего
              await markUserCompletedSwipes(latestSession.id, userId);
              setLoading(false);
              return;
            }

            const cardsData = (await Promise.all(
              unswipedCardIds.map(id => getDateCard(id))
            )).filter((card): card is DateCardType => card !== null);

            const cardsWithNumericId = cardsData.map((card, index) => ({
              ...card,
              numericId: index + 1,
              originalId: card.id
            }));

            setCards(cardsWithNumericId.sort(() => Math.random() - 0.5));
            setLoading(false);
            return;
          }
        }

        //нет сессии или она archived - загружаем все активные карточки
        const activeCards = await getActiveCoupleCards(currentCouple.id);
        if (!activeCards?.cardIds.length) {
          message.warning('No active cards available');
          setLoading(false);
          return;
        }

        const cardsData = (await Promise.all(
          activeCards.cardIds.map(id => getDateCard(id))
        )).filter((card): card is DateCardType => card !== null);

        const cardsWithNumericId = cardsData.map((card, index) => ({
          ...card,
          numericId: index + 1,
          originalId: card.id
        }));

        setCards(cardsWithNumericId.sort(() => Math.random() - 0.5));
      } catch (error) {
        message.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);



  useEffect(() => {
    const handleMatch = async () => {
      if (!currentSession?.id || !partnerId) return;
  
      try {
        const matchResult = await findAndUpdateMatches(currentSession.id);
        if (!matchResult?.matchedCards.length) return;
  
        const slot = await findAvailableSlot(
          matchResult.matchedCards[0],
          matchResult.userIds
        );
        if (!slot) return;
  
        const eventData = await getDateCard(matchResult.matchedCards[0]);
        if (!eventData) {
          message.error('Не удалось получить данные о мероприятии');
          return;
        }
  
        await createJointEvent({
          event: eventData,
          slot,
          userIds: matchResult.userIds
        });
  
        message.success(
          `Свидание запланировано на ${formatDateTime(slot.start)}!`,
          8 
        );
        
        message.info('Подробности отправлены в ваш календарь');
  
      } catch (error) {
        message.error('Произошла ошибка при планировании свидания');
        console.error('Match handling error:', error);
      }
    };
  
    handleMatch();
  }, [currentSession?.matchedCards, partnerId]);
  

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleSwipe = async (action: { id: string; direction: 'left' | 'right' }) => {
    if (!coupleId) return;

    const authUser = localStorage.getItem('authUser');
    if (!authUser) return;

    const { id: userId } = JSON.parse(authUser);
    if (!userId) return;

    try {
      let session = currentSession;

      if (!session || session.status === 'archived') {
        session = await createSwipeSession({
          coupleId,
          activeCoupleCardsId: `active_${coupleId}`,
          createdBy: userId,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          completedUserIds: [],
          matchedCards: [],
          swipes: {}
        });

        if (!session || !session.id) {
          message.error("Failed to create a new swipe session");
          return;
        }

        setCurrentSession(session);
      }

      if (!session.id) return;

      await updateUserSwipes(
        session.id,
        userId,
        action.direction === 'right' ? [action.id] : [],
        action.direction === 'left' ? [action.id] : []
      );

      setCards(prev => prev.filter(card => card.originalId !== action.id));

      if (cards.length <= 1) {
        await markUserCompletedSwipes(session.id, userId);
      }
    } catch (error) {
      message.error('свайп не сохранен');
    }
  };

  if (loading) return <div style={containerStyle}><Spin size="large" /></div>;

  //экран ожидания если:нет карточек, сессия в завершенном статусе
  if (!cards.length || (currentSession && COMPLETED_STATUSES.includes(currentSession.status))) {
    return <WaitingScreen />;
  }

  return (
    <div style={containerStyle}>
      {cards.map((card) => (
        <TinderCard
          key={card.numericId}
          card={card}
          cards={cards}
          setCards={setCards}
          onSwipe={handleSwipe}
        />
      ))}
    </div>
  );
};