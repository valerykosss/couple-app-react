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
  query,
  QueryDocumentSnapshot,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { v4 } from "uuid";
import { CalendarEventType } from "../../types/calendar";
import { message } from "antd";


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
const db = initializeFirestore(app, {});

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
  createdAt: string;
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
  eventsByUser: (userId: string) => query(
    dataPoint<CalendarEventType>('events'),
    where("userId", "==", userId)
  )
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

export async function updateUser(userId: string, user: Partial<FirebaseUserType>) {
  await updateDoc(dataPoints.userDoc(userId), user);
}

export async function deleteUser(userId: string) {
  await deleteDoc(dataPoints.userDoc(userId));
}

export async function getEventById(eventId: string) {
  const eventSnapshot = await getDoc(dataPoints.eventDoc(eventId));
  return eventSnapshot.data();
}

export async function getEventFromFirebaseByGoogleId(googleEventId: string) {
  const eventsSnapshot = await getDocs(dataPoints.events);
  return eventsSnapshot.docs
    .map(doc => doc.data())
    .find(event => event.googleEventId === googleEventId);
}

export async function getEventsByUser(userId: string) {
  const querySnapshot = await getDocs(dataPoints.eventsByUser(userId));
  return querySnapshot.docs.map(doc => doc.data());
}

export async function createEvent(event: CalendarEventType) {
  let eventId = event.id || event.htmlLink?.split('/').pop() || v4();
  await setDoc(dataPoints.eventDoc(eventId), {
    ...event,
    id: eventId,
  });
  return eventId;
}

export async function updateEvent(eventId: string, updatedEvent: Partial<CalendarEventType>) {
  await updateDoc(dataPoints.eventDoc(eventId), updatedEvent);
}

export async function deleteEvent(eventId: string) {
  await deleteDoc(dataPoints.eventDoc(eventId));
}