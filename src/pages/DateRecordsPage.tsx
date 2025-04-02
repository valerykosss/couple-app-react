// DateCardsPage.tsx
import React, { useEffect, useState } from 'react';
import { Button, Table, Form, Input, message, Image, Card } from 'antd';
import { ActiveCoupleCardsType, createDateCard, getActiveCoupleCards, getCoupleByUserIds, getCoupleDateCards, getDefaultDateCards, getUserCouples, updateActiveCoupleCards } from '../api/firebase/firebase';
import { useDispatch } from 'react-redux';
import { action, AppDispatch, useTypedSelector } from '../store';
import { DateCardType } from '../types/dateCards';

const { TextArea } = Input;


// const addDefaultCards = async () => {
//     const defaultCards = [
//         {
//           title: "Романтический ужин",
//           description: "Ужин при свечах в уютном ресторане",
//           imageUrl: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
//           durationMinutes: 120,
//           type: "default" as const,
//           coupleId: null
//         },
//         {
//           title: "Кофе в книжном",
//           description: "Знакомство за чашкой ароматного кофе",
//           imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
//           durationMinutes: 60,
//           type: "default" as const,
//           coupleId: null
//         },
//         {
//           title: "Велосипедная прогулка",
//           description: "Активный отдых в парке",
//           imageUrl: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
//           durationMinutes: 90,
//           type: "default" as const,
//           coupleId: null
//         },
//         {
//           title: "Кулинарный мастер-класс",
//           description: "Совместное приготовление ужина",
//           imageUrl: "https://images.unsplash.com/photo-1547592180-85f173990554?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
//           durationMinutes: 180,
//           type: "default" as const,
//           coupleId: null
//         },
//         {
//           title: "Фестиваль",
//           description: "Фестиваль под открытым небом",
//           imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
//           durationMinutes: 240,
//           type: "default" as const,
//           coupleId: null
//         },
//         {
//           title: "Посещение музея",
//           description: "Культурное свидание среди искусства",
//           imageUrl: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
//           durationMinutes: 120,
//           type: "default" as const,
//           coupleId: null
//         },
//         {
//           title: "Кинотеатр",
//           description: "Ретро-кинотеатр",
//           imageUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
//           durationMinutes: 150,
//           type: "default" as const,
//           coupleId: null
//         }
//       ];

//       const customCards = [
//         {
//           title: "Прогулка на закате",
//           description: "Совместная прогулка по набережной",
//           imageUrl: "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
//           durationMinutes: 120,
//           type: "custom" as const,
//           coupleId: "QhPv3JMrUAq02YEOUKbW",
//           createdBy: "03U07iXRTrN5wTJqDMh7aPiNgcx2"
//         },
//         {
//           title: "Концерт",
//           description: "Живая музыка и отличная атмосфера",
//           imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
//           durationMinutes: 180,
//           type: "custom" as const,
//           coupleId: "QhPv3JMrUAq02YEOUKbW",
//           createdBy: "03U07iXRTrN5wTJqDMh7aPiNgcx2"
//         },
//         {
//           title: "Компьютерные игры",
//           description: "Веселый вечер с играми",
//           imageUrl: "https://images.unsplash.com/photo-1560253023-3ec5d502959f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
//           durationMinutes: 120,
//           type: "custom" as const,
//           coupleId: "QhPv3JMrUAq02YEOUKbW",
//           createdBy: "03U07iXRTrN5wTJqDMh7aPiNgcx2"
//         },
//         {
//           title: "Дегустация вин",
//           description: "Знакомство с видами",
//           imageUrl: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
//           durationMinutes: 90,
//           type: "custom" as const,
//           coupleId: "QhPv3JMrUAq02YEOUKbW",
//           createdBy: "03U07iXRTrN5wTJqDMh7aPiNgcx2"
//         }
//       ];

//     try {
//       for (const card of defaultCards) {
//         await createDateCard(card);
//       }

//       for (const card of customCards) {
//         await createDateCard(card);
//       }

//       message.success('Тестовые карточки успешно добавлены');
//     } catch (error) {
//       message.error('Ошибка при добавлении карточек');
//       console.error(error);
//     }
//   };

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
      dispatch(action.dateCardsSlice.toggleCardActive(cardId));
      const activeCards = await getActiveCoupleCards(coupleId);
      if (activeCards) {
        await updateActiveCoupleCards(
          activeCards.id,
          activeCardIds.includes(cardId)
            ? activeCardIds.filter(id => id !== cardId)
            : [...activeCardIds, cardId]
        );
      }
    } catch (error) {
      console.error('Error toggling card:', error);
      message.error('Ошибка обновления карточки');
      dispatch(action.dateCardsSlice.toggleCardActive(cardId));
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

  // const handleAddTestCards = async () => {
  //   try {
  //     dispatch(action.dateCardsSlice.setLoading(true));
  //     await addDefaultCards(); // Ваша функция добавления тестовых карточек

  //     // Перезагружаем данные
  //     const [defaultCards, customCards] = await Promise.all([
  //       getDefaultDateCards(),
  //       coupleId ? getCoupleDateCards(coupleId) : Promise.resolve([])
  //     ]);

  //     dispatch(action.dateCardsSlice.setDefaultCards(defaultCards));
  //     dispatch(action.dateCardsSlice.setCustomCards(customCards));

  //     message.success('Тестовые карточки добавлены');
  //   } catch (error) {
  //     console.error('Error adding test cards:', error);
  //     message.error('Ошибка при добавлении тестовых карточек');
  //   } finally {
  //     dispatch(action.dateCardsSlice.setLoading(false));
  //   }
  // };

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
        {/* <Button 
            type="primary" 
            onClick={handleAddTestCards}
            style={{ marginBottom: 24 }}
            disabled={loading}
          >
            Добавить тестовые карточки (временная функция)
          </Button> */}

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