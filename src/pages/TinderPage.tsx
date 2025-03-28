import React, { Dispatch, SetStateAction, useState } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { HeartOutlined, CloseOutlined } from "@ant-design/icons";
import { Card } from "antd";
import { useDispatch } from "react-redux";
import { useTypedSelector } from "../store";
import swiperSlice from "../store/slices/swiperSlice";

const { Meta } = Card;

type CardType = {
    id: number;
    url: string;
    title?: string;
    description?: string;
};

type SwipeAction = {
    id: number;
    direction: 'left' | 'right';
};

type TinderCardProps = {
    id: number;
    url: string;
    title?: string;
    description?: string;
    setCards: Dispatch<SetStateAction<CardType[]>>;
    cards: CardType[];
    onSwipe: (action: SwipeAction) => void;
}

const containerStyle: React.CSSProperties = {
    display: 'grid',
    height: '600px',
    width: '100%',
    placeItems: 'center'
};

const motionStaticStyle: React.CSSProperties = {
    position: 'relative',
    height: '400px',
    width: '500px',
    transformOrigin: 'bottom',
    gridRow: 1,
    gridColumn: 1,
    transition: "0.125s transform",
};

const cardStaticStyle: React.CSSProperties = {
    height: '100%',
    width: '100%',
    borderRadius: '8px',
}

const imageCardStyle: React.CSSProperties = {
    height: '256px',
    width: '100%',
    objectFit: 'cover',
    pointerEvents: 'none'
}

const iconsWrapperStyle: React.CSSProperties = { 
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px',
    pointerEvents: 'auto'
}

const closeOutlinedStyle: React.CSSProperties = { 
    fontSize: '24px',
    color: '#ff4d4f',
    cursor: 'pointer'
}

const heartOutlinedStyle: React.CSSProperties = {
    fontSize: '24px',
    color: '#52c41a',
    cursor: 'pointer'
}

export function TinderPage() {
    const [cards, setCards] = useState<CardType[]>(cardData);
    const dispatch = useDispatch();
    const swipeHistory = useTypedSelector((state) => state.swiperSlice.history);

    const handleSwipe = (action: SwipeAction) => {
        dispatch(swiperSlice.actions.addSwipe(action));
        setCards(prev => prev.filter(card => card.id !== action.id));
        console.log(`Карточка ${action.id} свайпнута ${action.direction === 'right' ? 'вправо' : 'влево'}`);
    };

    return (
        <>
        <div style={{ marginBottom: "20px" }}>
                <h3>История свайпов:</h3>
                {swipeHistory.map((swipe, index) => (
                    <p key={index}>
                        {swipe.id} - {swipe.direction === "right" ? "Лайк" : "Дизлайк"}
                    </p>
                ))}
            </div>
        <div style={containerStyle}>
            {cards.map((card) => (
                <TinderCard 
                    key={card.id}
                    id={card.id}
                    url={card.url}
                    title={card.title}
                    description={card.description}
                    setCards={setCards}
                    cards={cards}
                    onSwipe={handleSwipe}
                />
            ))}
        </div>
        </>
    );
};

export function TinderCard({ id, url, title, description, setCards, cards, onSwipe }: TinderCardProps) {
    const x = useMotionValue(0);
    const rotateRaw = useTransform(x, [-150, 150], [-18, 18]);
    const opacity = useTransform(x, [-150, 0, 150], [0, 1, 0]);

    const isFront = id === cards[cards.length - 1].id;

    const rotate = useTransform(() => {
        const offset = isFront ? 0 : id % 2 ? 6 : -6;
        return `${rotateRaw.get() + offset}deg`;
    });

    const handleSwipeAction = (direction: 'left' | 'right') => {
        onSwipe({ id, direction });
        setCards(prev => prev.filter(card => card.id !== id));
    };

    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const threshold = 100;
        if (Math.abs(info.offset.x) > threshold) {
            const direction = info.offset.x > 0 ? 'right' : 'left';
            handleSwipeAction(direction);
        }
    };

    return (
        <motion.div
            style={{
                ...motionStaticStyle,
                x,
                opacity,
                rotate,
                boxShadow: isFront
                    ? "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)"
                    : undefined
            }}
            animate={{
                scale: isFront ? 1 : 0.98,
            }}
            drag={isFront ? "x" : false}
            dragConstraints={{
                left: 0,
                right: 0,
            }}
            onDragEnd={handleDragEnd}
        >
            <div style={{ pointerEvents: isFront ? 'auto' : 'none' }}>
                <Card
                    style={{
                        ...cardStaticStyle,
                        cursor: isFront ? 'grab' : 'default'
                    }}
                    cover={
                        <img
                            alt="card"
                            src={url}
                            style={imageCardStyle}
                        />
                    }
                    actions={[
                        <div style={iconsWrapperStyle}>
                            <CloseOutlined
                                style={closeOutlinedStyle}
                                onClick={() => isFront && handleSwipeAction('left')}
                            />
                            <HeartOutlined
                                style={heartOutlinedStyle}
                                onClick={() => isFront && handleSwipeAction('right')}
                            />
                        </div>
                    ]}
                >
                    <Meta
                        title={title || "Card Title"}
                        description={description || "This is the description"}
                    />
                </Card>
            </div>
        </motion.div>
    );
};

const cardData: CardType[] = [
    {
      id: 1,
      url: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      title: "Романтический ужин",
      description: "Ужин при свечах в уютном ресторане"
    },
    {
      id: 2,
      url: "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      title: "Прогулка на закате",
      description: "Совместная прогулка по набережной"
    },
    {
      id: 3,
      url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      title: "Кофе в книжном",
      description: "Знакомство за чашкой ароматного кофе"
    },
    {
      id: 4,
      url: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      title: "Велосипедная прогулка",
      description: "Активный отдых в парке"
    },
    {
      id: 5,
      url: "https://images.unsplash.com/photo-1547592180-85f173990554?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      title: "Кулинарный мастер-класс",
      description: "Совместное приготовление ужина"
    },
    {
      id: 6,
      url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      title: "Фестиваль",
      description: "Фестиваль под открытым небом"
    },
    {
      id: 7,
      url: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      title: "Посещение музея",
      description: "Культурное свидание среди искусства"
    },
    {
      id: 8,
      url: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      title: "Кинотеатр",
      description: "Ретро-кинотеатр"
    },
    {
      id: 9,
      url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      title: "Концерт",
      description: "Живая музыка и отличная атмосфера"
    },
    {
      id: 10,
      url: "https://images.unsplash.com/photo-1560253023-3ec5d502959f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      title: "Компьютерные игры",
      description: "Веселый вечер с играми"
    },
    {
      id: 11,
      url: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      title: "Дегустация вин",
      description: "Знакомство с видами"
    }
  ];