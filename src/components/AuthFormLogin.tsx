import { Form, Input, Button, FormProps, message } from 'antd';
import { InfoCircleOutlined, GoogleOutlined } from '@ant-design/icons';
import { RuleObject } from 'antd/es/form';
import { useDispatch } from 'react-redux';
import { action, AppDispatch } from '../store';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from 'react-router';
import handleGoogleAuth from '../utils/googleAuth';

type AuthFormLoginProps = {
  toggleForm: () => void;
  onClose: () => void;
}

type FieldType = {
  password: string;
  email: string;
};

export default function AuthFormLogin(props: AuthFormLoginProps) {
  const [form] = Form.useForm();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleGoogleLogin = () => handleGoogleAuth(false, dispatch, navigate, props.onClose);

  const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
    const { email, password } = values;
    const auth = getAuth();

    try {
      console.log('Попытка авторизоваться с email:', email); // Логируем попытку авторизации
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const token = await user.getIdToken();
      console.log('Авторизация прошла успешно, получен токен:', token);

      message.success(`Добро пожаловать, ${user.displayName}!`);
      dispatch(action.authSlice.initUser({
        email: user.email,
        id: user.uid,
        token: token, 
      }));
      props.onClose();
      navigate('/app');
      
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Ошибка авторизации:", error.message);
        message.error("Ошибка входа. Проверьте email и пароль.");
      }
    }
  };

  return (
    <Form
      form={form}
      name="login"
      onFinish={onFinish} 
      layout="vertical"
      requiredMark="optional"
    >
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
        tooltip={{ title: 'Пароль должен быть не короче 6 символов, содержать только латинские буквы, минимум одну строчную букву и одну цифру', icon: <InfoCircleOutlined /> }}
        label="Пароль"
        name="password"
        rules={[
          { required: true, message: 'Введите пароль' },
          { pattern: /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d\W]{6,}$/, message: 'Пароль должен быть не короче 6 символов и содержать минимум одну заглавную букву и одну цифру' },
        ]}
      >
        <Input.Password />
      </Form.Item>

      <br />
      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          Авторизоваться
        </Button>
      </Form.Item>

      <Form.Item>
        <Button type="default" icon={<GoogleOutlined />} block onClick={handleGoogleLogin}>
          Авторизоваться через Google
        </Button>
      </Form.Item>

      <Form.Item>
        <span>
          Нет аккаунта? <a onClick={props.toggleForm}>Зарегистрируйтесь</a>
        </span>
      </Form.Item>
    </Form>
  );
}