import { Modal, Form, Input, Button, message, DatePicker } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { action, AppDispatch } from "../store";
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { handleAddEvent, handleDeleteEvent, handleUpdateEvent } from "../utils/eventFullCalendarHandlers";

dayjs.extend(customParseFormat);

type EventModalData = {
  id?: string;
  title?: string;
  start: string;
  end: string;
} | null;

type EventCalendarModalProps = {
  visible: boolean;
  modalType: 'create' | 'editDelete';
  eventData: EventModalData;
};

function EventCalendarModal({ visible, eventData, modalType }: EventCalendarModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isDatesValid, setIsDatesValid] = useState(true);

  useEffect(() => {
    if (modalType === 'editDelete' && eventData) {
      form.setFieldsValue({
        title: eventData.title,
        start: dayjs(eventData.start),
        end: dayjs(eventData.end)
      });
    } else if (modalType === 'create' && eventData) {
      form.setFieldsValue({
        start: dayjs(eventData.start),
        end: dayjs(eventData.end)
      });
    } else {
      form.resetFields();
    }
  }, [modalType, eventData, form]);

  const handleDateChange = () => {
    const start = form.getFieldValue('start');
    const end = form.getFieldValue('end');
    setIsDatesValid(!start || !end || start < end);
  };

  const handleCreate = async () => {
    try {
      if (!eventData) {
        throw new Error("Не указано время события");
      }

      const values = await form.validateFields();
      await handleAddEvent(
        values,
        {
          start: eventData.start,
          end: eventData.end
        },
        dispatch,
        form,
        setLoading
      );
      message.success("Событие успешно создано");
    } catch (error) {
      console.error("Ошибка создания:", error);
      message.error(error instanceof Error ? error.message : "Не удалось создать событие");
    }
  };

  const handleUpdate = async () => {
    try {
      if (!eventData?.id) {
        throw new Error("Отсутствует ID события");
      }

      const values = await form.validateFields();

      const start = values.start ? values.start.toISOString() : eventData?.start;
      const end = values.end ? values.end.toISOString() : eventData?.end;

      if (!start || !end) {
        throw new Error("Не указано время события");
      }

      const updatedEvent = {
        id: eventData.id,
        title: values.title,
        start: start,
        end: end
      };

      await handleUpdateEvent(
        values,
        updatedEvent,
        dispatch,
        form,
        setLoading
      );
      message.success("Событие успешно обновлено");
    } catch (error) {
      console.error("Ошибка обновления:", error);
      message.error(error instanceof Error ? error.message : "Не удалось обновить событие");
    }
  };

  const handleDelete = async () => {
    try {
      if (!eventData?.id) {
        throw new Error("Отсутствует ID события");
      }

      await handleDeleteEvent(eventData.id, dispatch, setLoading);
      message.success("Событие успешно удалено");
    } catch (error) {
      console.error("Ошибка удаления:", error);
      message.error(error instanceof Error ? error.message : "Не удалось удалить событие");
    }
  };


  const handleCancel = () => {
    dispatch(action.eventModalSlice.hideModal());
  };

  return (
    <Modal
      title={modalType === 'create' ? 'Создать событие' : 'Редактировать/удалить событие'}
      open={visible}
      onOk={modalType === 'create' ? handleCreate : handleUpdate}
      confirmLoading={loading}
      onCancel={handleCancel}
      footer={
        modalType === 'create' ? (
          [
            <Button key="cancel" onClick={handleCancel}>
              Отмена
            </Button>,
            <Button key="submit" type="primary" loading={loading} onClick={handleCreate}>
              Создать
            </Button>,
          ]
        ) : (
          [
            <Button key="cancel" onClick={handleCancel}>
              Отмена
            </Button>,
            <Button key="delete" danger onClick={handleDelete}>
              Удалить
            </Button>,
            <Button key="submit" type="primary" loading={loading} onClick={handleUpdate}>
              Обновить
            </Button>,
          ]
        )
      }
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="title"
          label="Название события"
          rules={[{ required: true, message: "Введите название события!" }]}
        >
          <Input placeholder="Введите название события" />
        </Form.Item>
        {modalType === 'editDelete' && eventData && (
          <>
            <Form.Item
              name="start"
              label="Начало события"
              rules={[
                { required: true, message: "Укажите время начала" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || !getFieldValue('end') || value < getFieldValue('end')) {
                      return Promise.resolve();
                    }
                    return Promise.reject('Время начала должно быть раньше окончания');
                  },
                }),
              ]}
            >
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm"
                placeholder="Выберите время начала"
                style={{ width: '100%' }}
                disabledDate={(current) => current && current < dayjs().startOf('day')}
                onChange={handleDateChange}
              />
            </Form.Item>
            <Form.Item
              name="end"
              label="Конец события"
              rules={[
                { required: true, message: "Укажите время окончания" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || !getFieldValue('start') || value > getFieldValue('start')) {
                      return Promise.resolve();
                    }
                    return Promise.reject('Время окончания должно быть позже начала');
                  },
                }),
              ]}
            >
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm"
                placeholder="Выберите время окончания"
                style={{ width: '100%' }}
                onChange={handleDateChange}
              />
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
};

export default EventCalendarModal;