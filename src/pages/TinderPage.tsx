import { useEffect, useState } from 'react';
import { Spin, Typography, message } from 'antd';
import { DateCardType, SwipeSession } from '../types/dateCards';
import {
    createSwipeSession,
    getActiveCoupleCards,
    getActiveSwipeSession,
    getDateCard,
    getUserCouples,
    markUserCompletedSwipes,
    subscribeToSession,
    updateUserSwipes,
    getCoupleByUserIds
} from '../api/firebase/firebase';
import { WaitingScreen } from '../components/WaitingScreen';
import { TinderCard } from '../components/TinderCard';

const { Title, Text } = Typography;

const containerStyle: React.CSSProperties = {
    position: 'relative',
    height: '600px',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
};


export const TinderPage = () => {
    const [cards, setCards] = useState<(DateCardType & { numericId: number; originalId: string })[]>([]);
    const [currentSession, setCurrentSession] = useState<SwipeSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [partnerCompleted, setPartnerCompleted] = useState(false);
    const [partnerId, setPartnerId] = useState<string | null>(null);
    const [coupleId, setCoupleId] = useState<string>('');


    useEffect(() => {
        const loadData = async () => {
            try {
                const authUser = localStorage.getItem('authUser');
                if (!authUser) {
                    message.error("Не удалось найти данные пользователя.");
                    return null;
                }

                const parsedAuthUser = JSON.parse(authUser);
                const userId = parsedAuthUser.id;

                if (!userId) {
                    message.warning('Пользователь не авторизован');
                    setLoading(false);
                    return;
                }

                // 2. Получаем пары пользователя
                const couples = await getUserCouples(userId);
                if (!couples.length) {
                    message.warning('Вы не состоите ни в одной паре');
                    setLoading(false);
                    return;
                }

                // 3. Находим partnerId и coupleId
                const currentPartnerId = couples[0]?.usersId.find(id => id !== userId) ?? null;
                setPartnerId(currentPartnerId);
                setCoupleId(couples[0].id);

                // 4. Загружаем активные карточки
                const activeCards = await getActiveCoupleCards(couples[0].id);
                if (!activeCards?.cardIds.length) {
                    message.warning('Нет активных карточек для свайпов');
                    setLoading(false);
                    return;
                }

                // 5. Загружаем данные карточек
                const cardsData = (await Promise.all(
                    activeCards.cardIds.map(id => getDateCard(id))
                )).filter((card): card is DateCardType => card !== null);

                // Добавляем numericId
               // В функции loadData:
                const cardsWithNumericId = cardsData.map((card, index) => ({
                    ...card,
                    numericId: index + 1,
                    // Сохраняем оригинальный ID как string
                    originalId: card.id 
                }));
                //setCards(cardsData.sort(() => Math.random() - 0.5));
                setCards(cardsWithNumericId.sort(() => Math.random() - 0.5));

                // 6. Проверяем активную сессию
                const session = await getActiveSwipeSession(couples[0].id);
                if (session) {
                    setCurrentSession(session);
                    if (currentPartnerId && session.completedUserIds.includes(currentPartnerId)) {
                        setPartnerCompleted(true);
                    }
                }
            } catch (error) {
                console.error('Error loading data:', error);
                message.error('Ошибка загрузки данных');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // Подписка на изменения сессии
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

        return unsubscribe;
    }, [currentSession?.id, partnerId]);

    const handleSwipe = async (action: { id: string; direction: 'left' | 'right' }) => {
        if (!coupleId) return;

        const userId = localStorage.getItem('userId');
        if (!userId) return;

        try {
            await updateUserSwipes(
                currentSession?.id || '',
                userId,
                action.direction === 'right' ? [action.id] : [],
                action.direction === 'left' ? [action.id] : []
            );

            if (cards.length === 1) {
                await markUserCompletedSwipes(currentSession?.id || '', userId);
            }
        } catch (error) {
            console.error('Error saving swipe:', error);
            message.error('Ошибка при сохранении свайпа');
        }
    };

    if (loading) {
        return (
            <div style={containerStyle}>
                <Spin size="large" />
            </div>
        );
    }

    if (!cards.length) {
        return (
            <div style={containerStyle}>
                <Title level={4}>Нет активных карточек</Title>
                <Text>Добавьте карточки в настройках</Text>
            </div>
        );
    }

    if (partnerCompleted) {
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