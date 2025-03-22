import { Form, Input, Button, FormProps, message } from 'antd';
import { InfoCircleOutlined, GoogleOutlined } from '@ant-design/icons';
import { RuleObject } from 'antd/es/form';
import { useDispatch } from 'react-redux';
import { action } from '../store';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from 'react-router';

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
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
    const { email, password } = values;
    const auth = getAuth();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const token = await user.getIdToken();

      message.success(`Добро пожаловать, ${user.email}!`);
      dispatch(action.authSlice.initUser({
        email: user.email,
        id: user.uid,
        token: token, 
      }));
      props.onClose();
      navigate('/app');
      
    } catch (error: any) {
      console.error("Ошибка авторизации:", error.message);
      message.error("Ошибка входа. Проверьте email и пароль.");

      form.setFields([
        {
          name: "email",
          errors: error.code === "auth/user-not-found" ? ["Пользователь не найден"] : [],
        },
        {
          name: "password",
          errors: error.code === "auth/wrong-password" ? ["Неверный пароль"] : [],
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
        rules={passwordRules}
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
        <Button type="default" icon={<GoogleOutlined />} block>
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
};