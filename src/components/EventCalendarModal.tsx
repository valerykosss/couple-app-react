import { Modal, Form, Input, Button, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { action, AppDispatch } from "../store";
import { handleAddEvent, handleDeleteEvent, handleUpdateEvent } from "../utils/eventFullCalendarHandlers";

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

  useEffect(() => {
    if (modalType === 'editDelete' && eventData) {
      form.setFieldsValue({
        title: eventData.title,
      });
    } else {
      form.resetFields();
    }
  }, [modalType, eventData, form]);

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
      await handleUpdateEvent(
        values,
        {
          id: eventData.id,
          start: eventData.start,
          end: eventData.end
        },
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
            <Form.Item label="Начало">
              <Input value={new Date(eventData.start).toLocaleString()} />
            </Form.Item>
            <Form.Item label="Конец">
              <Input value={new Date(eventData.end).toLocaleString()} />
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
};

export default EventCalendarModal;