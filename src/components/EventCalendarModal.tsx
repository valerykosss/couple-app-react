import { Modal, Form, Input, Button, message } from "antd";
import { useDispatch } from "react-redux";
import { useState } from "react";
import { action, AppDispatch } from "../store";
import handleAddEvent from "../utils/eventFullCalendarHandlers";

type EventCalendarModalProps = {
  visible: boolean;
  eventData: { start: string; end: string } | null;
};

function EventCalendarModal({ visible, eventData }: EventCalendarModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await handleAddEvent(values, eventData, dispatch, form, setLoading);
    } catch (error) {
      console.error("Ошибка валидации:", error);
    }
  };

  const handleCancel = () => {
    dispatch(action.eventModalSlice.hideModal());
  };

  return (
    <Modal
      title="Создать событие"
      open={visible}
      onOk={handleOk}
      confirmLoading={loading}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Отмена
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleOk}>
          Создать
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="title"
          label="Название события"
          rules={[{ required: true, message: "Введите название события!" }]}
        >
          <Input placeholder="Введите название события" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EventCalendarModal;