import { useEffect, useState } from 'react';
import { Spin, Typography, message } from 'antd';
import { DateCardType, SwipeSessionType } from '../types/dateCards';
import {
  createSwipeSession,
  getActiveCoupleCards,
  getActiveSwipeSession,
  getDateCard,
  getUserCouples,
  markUserCompletedSwipes,
  subscribeToSession,
  updateUserSwipes
} from '../api/firebase/firebase';
import { WaitingScreen } from '../components/WaitingScreen';
import { TinderCard } from '../components/TinderCard';

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

        const session = await getActiveSwipeSession(currentCouple.id);

        if (session) {
          setCurrentSession(session);
        }
      } catch (error) {
        message.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!currentSession?.id || !partnerId) return;

    const unsubscribe = subscribeToSession(currentSession.id, (session) => {
      if (session) {
        setCurrentSession(session);
        if (session.completedUserIds.includes(partnerId)) {
          setPartnerCompleted(true);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [currentSession?.id, partnerId]);

  const handleSwipe = async (action: { id: string; direction: 'left' | 'right' }) => {
    if (!coupleId) return;

    const authUser = localStorage.getItem('authUser');
    if (!authUser) return;

    const { id: userId } = JSON.parse(authUser);
    if (!userId) return;

    try {
      let session = currentSession;

      if (!session) {
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
      message.error('Failed to save swipe');
    }
  };

  if (loading) return <div style={containerStyle}><Spin size="large" /></div>;

  if (!cards.length) return <WaitingScreen />;

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