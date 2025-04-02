// DateCardsPage.tsx
import React, { useEffect, useState } from 'react';
import { Button, Table, Form, Input, message, Image, Card } from 'antd';
import { ActiveCoupleCardsType, createActiveCoupleCards, createDateCard, getActiveCoupleCards, getCoupleByUserIds, getCoupleDateCards, getDefaultDateCards, getUserCouples, updateActiveCoupleCards } from '../api/firebase/firebase';
import { useDispatch } from 'react-redux';
import { action, AppDispatch, useTypedSelector } from '../store';
import { DateCardType } from '../types/dateCards';

const { TextArea } = Input;


const DateRecordsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { id: userId } = useTypedSelector(state => state.authSlice);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [coupleId, setCoupleId] = useState<string>('');
  const {
    defaultCards,
    customCards,
    activeCardIds,
    loading
  } = useTypedSelector(state => state.dateCardsSlice);

  const [form] = Form.useForm();


  useEffect(() => {
    const loadPartnerAndCouple = async () => {
      if (!userId) return;

      dispatch(action.dateCardsSlice.setLoading(true));

      try {
        const couples = await getUserCouples(userId);
        if (!couples.length) {
          dispatch(action.dateCardsSlice.setError('Вы не состоите ни в одной паре'));
          return;
        }

        const currentPartnerId = couples[0]?.usersId.find(id => id !== userId) ?? null;
        setPartnerId(currentPartnerId);
        dispatch(action.calendarSlice.setPartnerId(currentPartnerId));

        setCoupleId(couples[0].id);
      } catch (error) {
        console.error('Error loading partner data:', error);
        dispatch(action.dateCardsSlice.setError('Ошибка загрузки данных партнера'));
      } finally {
        dispatch(action.dateCardsSlice.setLoading(false));
      }
    };

    loadPartnerAndCouple();
  }, [userId, dispatch]);


  useEffect(() => {
    const loadCards = async () => {
      if (!coupleId) return;

      dispatch(action.dateCardsSlice.setLoading(true));

      try {
        const [defaultCards, customCards, activeCards] = await Promise.all([
          getDefaultDateCards(),
          getCoupleDateCards(coupleId),
          getActiveCoupleCards(coupleId)
        ]);

        dispatch(action.dateCardsSlice.setDefaultCards(defaultCards));
        dispatch(action.dateCardsSlice.setCustomCards(customCards));
        dispatch(action.dateCardsSlice.setActiveCardIds(activeCards?.cardIds || []));
      } catch (error) {
        console.error('Error loading cards:', error);
        dispatch(action.dateCardsSlice.setError('Ошибка загрузки карточек'));
      } finally {
        dispatch(action.dateCardsSlice.setLoading(false));
      }
    };

    loadCards();
  }, [coupleId, dispatch]);

  const allCards = [...defaultCards, ...customCards];

  const handleToggleCard = async (cardId: string) => {
    if (!coupleId) return;
  
    try {
      const activeCards = await getActiveCoupleCards(coupleId);
      
      const newCardIds = activeCardIds.includes(cardId)
        ? activeCardIds.filter(id => id !== cardId)
        : [...activeCardIds, cardId];
  
      if (activeCards) {
        await updateActiveCoupleCards(activeCards.id, newCardIds);
      } else {
        await createActiveCoupleCards(coupleId, newCardIds);
      }
  
      dispatch(action.dateCardsSlice.setActiveCardIds(newCardIds));
    } catch (error) {
      console.error('Error toggling card:', error);
      message.error('Ошибка обновления карточки');
    }
  };

  const handleAddCustomCard = async (values: {
    title: string;
    description: string;
    durationMinutes: number;
    imageUrl: string;
  }) => {
    if (!coupleId || !userId) return;

    try {
      dispatch(action.dateCardsSlice.setLoading(true));

      const newCard = await createDateCard({
        ...values,
        type: 'custom',
        coupleId,
        createdBy: userId,
      });

      const updatedCustomCards = await getCoupleDateCards(coupleId);
      dispatch(action.dateCardsSlice.setCustomCards(updatedCustomCards));

      message.success('Карточка успешно добавлена');
      form.resetFields();
    } catch (error) {
      console.error('Error adding card:', error);
      message.error('Ошибка при добавлении карточки');
    } finally {
      dispatch(action.dateCardsSlice.setLoading(false));
    }
  };

  const columns = [
    {
      title: 'Изображение',
      dataIndex: 'imageUrl',
      key: 'image',
      render: (url: string) => <Image src={url} width={100} />,
    },
    {
      title: 'Название',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Описание',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Тип',
      dataIndex: 'type',
      key: 'type',
      render: (type: string, record: DateCardType) => (
        type === 'default' ? 'Стандартная' : `Кастомная (создана ${record.createdBy === userId ? 'вами' : 'партнером'})`
      ),
    },
    {
      title: 'Длительность (мин)',
      dataIndex: 'durationMinutes',
      key: 'duration',
    },
    {
      title: 'Статус',
      key: 'status',
      render: (_: any, record: DateCardType) => (
        activeCardIds.includes(record.id) ? 'Активна' : 'Неактивна'
      ),
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: any, record: DateCardType) => (
        <Button
          type={activeCardIds.includes(record.id) ? 'default' : 'primary'}
          onClick={() => handleToggleCard(record.id)}
          disabled={loading}
        >
          {activeCardIds.includes(record.id) ? 'Деактивировать' : 'Активировать'}
        </Button>
      ),
    },
  ];

  if (!userId || !partnerId) {
    return <div>Загрузка данных пользователя...</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card title="Управление карточками свиданий" style={{ marginBottom: 24 }}>
        <Table
          columns={columns}
          dataSource={allCards}
          rowKey="id"
          loading={loading}
          pagination={false}
          locale={{ emptyText: 'Нет доступных карточек' }}
        />
      </Card>

      <Card title="Добавить кастомную карточку">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddCustomCard}
        >
          <Form.Item
            name="title"
            label="Название"
            rules={[{ required: true, message: 'Введите название' }]}
          >
            <Input placeholder="Название свидания" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Описание"
            rules={[{ required: true, message: 'Введите описание' }]}
          >
            <TextArea rows={3} placeholder="Описание свидания" />
          </Form.Item>

          <Form.Item
            name="imageUrl"
            label="Ссылка на изображение"
            rules={[
              { required: true, message: 'Введите ссылку' },
              { type: 'url', message: 'Введите корректную ссылку' }
            ]}
          >
            <Input placeholder="https://example.com/image.jpg" />
          </Form.Item>

          <Form.Item
            name="durationMinutes"
            label="Длительность (минуты)"
            rules={[
              { required: true, message: 'Введите длительность' },
              { pattern: /^[0-9]+$/, message: 'Только числа' }
            ]}
          >
            <Input type="number" placeholder="60" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              disabled={!coupleId}
            >
              Добавить карточку
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default DateRecordsPage;