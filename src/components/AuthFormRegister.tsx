import React from 'react';
import { Form, Input, Button, FormProps, message } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';
import { RuleObject } from 'antd/es/form';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { AppDispatch } from '../store';
import handleGoogleAuth from '../api/googleAuth/googleAuth';
import { createUser } from '../api/firebase/firebase';

type AuthFormRegisterProps = {
  toggleForm: () => void;
  onClose: () => void;
}

type FieldType = {
  password: string;
  confirmPassword: string;
  email: string;
  username: string;
};

export default function AuthFormRegister(props: AuthFormRegisterProps) {
  const [form] = Form.useForm();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleGoogleRegister = () =>
    handleGoogleAuth({
      isRegister: true,
      dispatch,
      navigate,
      onClose: props.onClose,
      showWelcomeMessage: true
    });

  const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
    const { email, password, username } = values;
    const auth = getAuth();

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: username });

      await createUser({
        id: user.uid,
        email: user.email!,
        username: username,
        createdAt: new Date().toISOString(),
      });

      props.toggleForm();

    } catch (error: any) {
      message.error("Ошибка регистрации. Проверьте данные.");

      form.setFields([
        {
          name: "email",
          errors: error.code === "auth/email-already-in-use" ? ["Этот email уже используется"] : [],
        },
        {
          name: "password",
          errors: error.code === "auth/weak-password" ? ["Слабый пароль"] : [],
        },
      ]);
    }
  };


  const passwordRules: RuleObject[] = [
    {
      required: true,
      message: 'Введите пароль',
    },
    {
      pattern: /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d\W]{6,}$/,
      message: 'Пароль должен быть не короче 6 символов, содержать только латинские буквы, минимум одну строчную букву и одну цифру',
    },
  ];

  const confirmPasswordRules: RuleObject[] = [
    {
      required: true,
      message: 'Подтвердите пароль'
    },
    {
      validator(_, value) {
        const password = form.getFieldValue('password');
        if (!value) {
          return Promise.resolve();
        }
        if (value === password) {
          return Promise.resolve();
        }
        return Promise.reject('Пароли не совпадают');
      }
    },
  ];

  return (
    <Form
      form={form}
      name="register"
      layout="vertical"
      requiredMark="optional"
      onFinish={onFinish}
    //   onFinishFailed={onFinishFailed}
    >
      <Form.Item
        label="Имя пользователя"
        name="username"
        rules={[
          { required: true, message: 'Введите имя пользователя' },
          { min: 3, message: 'Имя пользователя должно быть не менее 3 символов' },
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Email"
        name="email"
        rules={[
          { required: true, message: 'Введите email' },
          { type: 'email', message: 'Введите корректный email' },
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Пароль"
        name="password"
        rules={passwordRules}
        tooltip={{
          title: 'Пароль должен быть не короче 6 символов, содержать только латинские буквы, минимум одну строчную букву и одну цифру',
        }}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item
        label="Подтверждение пароля"
        name="confirmPassword"
        rules={confirmPasswordRules}
      >
        <Input.Password />
      </Form.Item>

      <br />
      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          Зарегистрироваться
        </Button>
      </Form.Item>

      <Form.Item>
        <Button type="default" icon={<GoogleOutlined />} onClick={handleGoogleRegister} block>
          Зарегистрироваться через Google
        </Button>
      </Form.Item>

      <Form.Item>
        <span>
          Уже есть аккаунт? <a onClick={props.toggleForm}>Войти</a>
        </span>
      </Form.Item>
    </Form>
  );
}

