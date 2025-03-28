import { Modal, Form, Input, Button } from 'antd';
import { CalendarEventType } from '../types/calendar';

type EventModalProps = {
  event: CalendarEventType | null;
  visible: boolean;
  onCancel: () => void;
  onDelete?: (eventId: string) => void;
  onUpdate?: (event: CalendarEventType) => void;
};

export function EventModal({ event, visible, onCancel, onDelete, onUpdate }: EventModalProps) {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (event && onUpdate) {
        onUpdate({
          ...event,
          summary: values.title,
        });
      }
    } catch (error) {
      console.error('Ошибка валидации:', error);
    }
  };

  const handleDelete = () => {
    if (event?.id && onDelete) {
      onDelete(event.id);
    }
  };

  return (
    <Modal
      title="Редактирование события"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button danger key="delete" onClick={handleDelete}>
          Удалить
        </Button>,
        <Button type="primary" key="update" onClick={handleSubmit}>
          Обновить
        </Button>,
      ]}
    >
      <Form form={form} initialValues={event ? { title: event.summary } : {}}>
        <Form.Item 
          name="title" 
          label="Название события"
          rules={[{ required: true, message: 'Пожалуйста, введите название события' }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
}