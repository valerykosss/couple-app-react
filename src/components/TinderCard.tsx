import { motion, useMotionValue, useTransform } from "framer-motion";
import { HeartOutlined, CloseOutlined } from "@ant-design/icons";
import { Card } from "antd";
import { PanInfo } from "framer-motion";
import { CardWithNumericId } from "../types/dateCards";

const { Meta } = Card;

type TinderCardProps = {
  card: CardWithNumericId;
  cards: CardWithNumericId[];
  setCards: React.Dispatch<React.SetStateAction<CardWithNumericId[]>>;
  onSwipe: (action: { id: string; direction: 'left' | 'right' }) => void;
};

const cardStaticStyle: React.CSSProperties = {
  height: '100%',
  width: '100%',
  borderRadius: '8px',
};

const imageCardStyle: React.CSSProperties = {
  height: '256px',
  width: '100%',
  objectFit: 'cover',
  pointerEvents: 'none'
};

const iconsWrapperStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '8px',
  pointerEvents: 'auto'
};

const closeOutlinedStyle: React.CSSProperties = {
  fontSize: '24px',
  color: '#ff4d4f',
  cursor: 'pointer'
};

const heartOutlinedStyle: React.CSSProperties = {
  fontSize: '24px',
  color: '#52c41a',
  cursor: 'pointer'
};

export const TinderCard = ({ card, cards, setCards, onSwipe }: TinderCardProps) => {
  const x = useMotionValue(0);
  const rotateRaw = useTransform(x, [-150, 150], [-18, 18]);
  const opacity = useTransform(x, [-150, 0, 150], [0, 1, 0]);

  const isFront = card.numericId === cards[cards.length - 1].numericId;

  const rotate = useTransform(() => {
    const offset = isFront ? 0 : card.numericId % 2 ? 6 : -6;
    return `${rotateRaw.get() + offset}deg`;
  });

  const handleSwipeAction = (direction: 'left' | 'right') => {
    onSwipe({ id: card.originalId, direction });
    setCards(prev => prev.filter(c => c.numericId !== card.numericId));
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const threshold = 100;
    if (Math.abs(info.offset.x) > threshold) {
      handleSwipeAction(info.offset.x > 0 ? 'right' : 'left');
    }
  };

  return (
    <motion.div
      style={{
        position: 'absolute',
        height: '400px',
        width: '500px',
        transformOrigin: 'bottom',
        x,
        opacity,
        rotate,
        boxShadow: isFront ? "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)" : undefined
      }}
      animate={{
        scale: isFront ? 1 : 0.98,
      }}
      drag={isFront ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
    >
      <div style={{ pointerEvents: isFront ? 'auto' : 'none' }}>
        <Card
          style={{ ...cardStaticStyle, cursor: isFront ? 'grab' : 'default' }}
          cover={<img alt={card.title} src={card.imageUrl} style={imageCardStyle} />}
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
          <Meta title={card.title} description={card.description} />
        </Card>
      </div>
    </motion.div>
  );
};