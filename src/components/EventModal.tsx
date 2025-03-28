import { Modal, Form, Input, Button, message, Tag } from 'antd';
import { useEffect, useState } from 'react';
import { CalendarEventType } from '../types/calendar';

type EventModalProps = {
  event: CalendarEventType | null;
  visible: boolean;
  onCancel: () => void;
  onDelete: (eventId: string) => Promise<void>;
  onUpdate: (event: CalendarEventType) => Promise<void>;
}

export function EventModal({ event, visible, onCancel, onDelete, onUpdate }: EventModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (event) {
      form.setFieldsValue({
        title: event.summary,
        start: event.start.dateTime.replace('Z', ''),
        end: event.end.dateTime.replace('Z', '')
      });
    }
  }, [event, form]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      if (!event) return;
      
      await onUpdate({
        ...event,
        summary: values.title,
        start: { 
          dateTime: new Date(values.start).toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone 
        },
        end: { 
          dateTime: new Date(values.end).toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone 
        }
      });
    } catch (error) {
      console.error('Ошибка при обновлении события:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      if (event) {
        await onDelete(event.id);
      }
    } catch (error) {
      console.error('Ошибка при удалении события:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Редактирование события"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button 
          danger 
          onClick={handleDelete}
          loading={loading}
          key="delete"
        >
          Удалить
        </Button>,
        <Button 
          type="primary" 
          onClick={handleSubmit}
          loading={loading}
          key="update"
        >
          Обновить
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item 
          name="title" 
          label="Название события"
          rules={[{ required: true, message: 'Введите название события' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item 
          name="start" 
          label="Начало"
          rules={[{ required: true, message: 'Укажите дату и время начала' }]}
        >
          <Input type="datetime-local" />
        </Form.Item>
        <Form.Item 
          name="end" 
          label="Окончание"
          rules={[{ required: true, message: 'Укажите дату и время окончания' }]}
        >
          <Input type="datetime-local" />
        </Form.Item>
      </Form>
    </Modal>
  );
}