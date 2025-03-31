import { initializeApp } from "firebase/app";
import {
  collection,
  deleteDoc,
  doc,
  DocumentData,
  FirestoreDataConverter,
  getDoc,
  getDocs,
  initializeFirestore,
  onSnapshot,
  query,
  QueryDocumentSnapshot,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { v4 } from "uuid";
import { CalendarEventType } from "../../types/calendar";
import { message } from "antd";
import { action, AppDispatch } from "../../store";


const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain:  process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL:  process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId:  process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket:  process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:  process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId:  process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {});

//конвертирует данные при получении из Firestore, добавляя id документа, возвращает FirestoreDataConverter<T>, который преобразует данные при чтении/записи
function converter<T extends DocumentData>(): FirestoreDataConverter<T> {
  return {
    toFirestore: (data) => data,
    fromFirestore: (snap: QueryDocumentSnapshot<T>) => ({
      ...snap.data(),
      id: snap.id,
    }),
  }
}

//создаёт ссылку на коллекцию в Firestore с применением конвертера
//получает path – основной путь("users"), pathSegments – дополнительные сегменты (например в users/{userId}/todos)
function dataPoint<T extends DocumentData>(path: string, ...pathSegments: string[]) {
  return collection(db, path, ...pathSegments).withConverter(converter<T>())
}

//создаёт ссылку на документ (вместо коллекции), path – основной путь (например, "users"). pathSegments – ID документа. 
function dataPointForOne<T extends DocumentData>(path: string, ...pathSegments: string[]) {
  return doc(db, path, ...pathSegments).withConverter(converter<T>())
}

export type FirebaseUserType = {
  id: string;
  email: string;
  username: string;
  firebaseToken: string;
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiresIn: string | null;

}

const dataPoints = {
  //ссылка на всех пользователей
  users: dataPoint<FirebaseUserType>('users'),
  //ссылка на одного пользователя
  userDoc: (userId: string) => dataPointForOne<FirebaseUserType>('users', userId),
  //на коллекцию событий
  events: dataPoint<CalendarEventType>('events'),
  //на одно событие
  eventDoc: (eventId: string) => dataPointForOne<CalendarEventType>('events', eventId),
}

//USER
//все пользователи
export async function getUsers() {
  const usersSnapshot = await getDocs(dataPoints.users);
  return usersSnapshot.docs.map(item => item.data());
}

//один пользователь
export async function getUser(userId: string) {
  const usersSnapshot = await getDoc(dataPoints.userDoc(userId));
  return usersSnapshot.data();
}

//не полностью можно передавать 
export async function createUser(user: Partial<FirebaseUserType>) {
  const userId = v4();
  await setDoc(dataPoints.userDoc(userId), user);

  return userId;
}

async function findUserDocIdByUserId(userId: string) {
  const usersSnapshot = await getDocs(query(dataPoints.users, where("id", "==", userId)));
  if (usersSnapshot.empty) return null; 
  return usersSnapshot.docs[0].id;
}

export async function updateUser(userId: string, user: Partial<FirebaseUserType>) {
  const userDocId = await findUserDocIdByUserId(userId);
  if (!userDocId) {
    console.error(`Пользователь с UID ${userId} не найден в Firestore`);
    return;
  }
  await updateDoc(dataPoints.userDoc(userDocId), user);
}

export async function deleteUser(userId: string) {
  await deleteDoc(dataPoints.userDoc(userId));
}

export async function getEventById(eventId: string) {
  const eventSnapshot = await getDoc(dataPoints.eventDoc(eventId));
  return eventSnapshot.data();
}

export async function getEventsByUserId(userId: string): Promise<CalendarEventType[]> {
  try {
    const eventsQuery = query(
      dataPoints.events,
      where("userIds", "array-contains", userId)
    );

    const querySnapshot = await getDocs(eventsQuery);

    return querySnapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.error("Ошибка при получении событий пользователя:", error);
    message.error("Не удалось загрузить события");
    throw error;
  }
}
// export async function createEvent(event: CalendarEventType) {
//   let eventId = event.id || event.htmlLink?.split('/').pop() || v4();
//   await setDoc(dataPoints.eventDoc(eventId), {
//     ...event,
//     id: eventId,
//     userIds: event.userIds || [event.createdBy],
//   });
//   return eventId;
// }

export async function createEvent(event: CalendarEventType) {
  // Сохраняем оригинальный eventId из Google или генерируем новый
  const eventId = event.id || event.htmlLink?.split('/').pop() || v4();
  
  // Получаем существующее событие (если есть)
  const existingEvent = await getEventById(eventId);
  
  // Явно проверяем наличие createdBy (хотя он есть в типе)
  if (!event.createdBy) {
    throw new Error("Для создания события required поле createdBy");
  }

  if (existingEvent) {
    // Нормализуем userIds (на случай если undefined)
    const existingUserIds = existingEvent.userIds || [];
    
    // Добавляем текущего пользователя, если его нет
    if (!existingUserIds.includes(event.createdBy)) {
      await updateDoc(dataPoints.eventDoc(eventId), {
        userIds: [...existingUserIds, event.createdBy], // Добавляем пользователя
        updatedAt: new Date().toISOString()
      });
    }
    return eventId;
  }

  // Создаем новое событие
  await setDoc(dataPoints.eventDoc(eventId), {
    ...event,
    id: eventId,
    userIds: [event.createdBy], // Только создатель
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  return eventId;
}
export async function updateEvent(eventId: string, updatedEvent: Partial<CalendarEventType>) {
  await updateDoc(dataPoints.eventDoc(eventId), updatedEvent);
}

export async function deleteEvent(eventId: string) {
  // await deleteDoc(dataPoints.eventDoc(eventId));
  const docRef = dataPoints.eventDoc(eventId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    throw new Error(`Событие с ID ${eventId} не найдено в Firestore`);
  }
  
  await deleteDoc(docRef);
}

export function subscribeToUserEvents(userId: string, dispatch: AppDispatch) {
  const eventsQuery = query(
    collection(db, "events"), 
    where("userIds", "array-contains", userId)
  );

  const unsubscribe = onSnapshot(eventsQuery, (snapshot) => {
    const userEvents = snapshot.docs.map((doc) => doc.data() as CalendarEventType);
    dispatch(action.calendarSlice.setEvents(userEvents));
  });

  return unsubscribe;
}