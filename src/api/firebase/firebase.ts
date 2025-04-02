import { FirebaseError, initializeApp } from "firebase/app";
import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  DocumentData,
  FirestoreDataConverter,
  getDoc,
  getDocs,
  initializeFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  QueryDocumentSnapshot,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { v4 } from "uuid";
import { CalendarEventType, TimeSlot } from "../../types/calendar";
import { message } from "antd";
import { action, AppDispatch } from "../../store";
import { Action, AnyAction } from "@reduxjs/toolkit";
import {
  ActiveCoupleCards,
  DateCardType,
  SwipeSessionType,
} from "../../types/dateCards";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
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
  };
}

//создаёт ссылку на коллекцию в Firestore с применением конвертера
//получает path – основной путь("users"), pathSegments – дополнительные сегменты (например в users/{userId}/todos)
function dataPoint<T extends DocumentData>(
  path: string,
  ...pathSegments: string[]
) {
  return collection(db, path, ...pathSegments).withConverter(converter<T>());
}

//создаёт ссылку на документ (вместо коллекции), path – основной путь (например, "users"). pathSegments – ID документа.
function dataPointForOne<T extends DocumentData>(
  path: string,
  ...pathSegments: string[]
) {
  return doc(db, path, ...pathSegments).withConverter(converter<T>());
}

export type FirebaseUserType = {
  id: string;
  email: string;
  username: string;
  firebaseToken: string;
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiresIn: string | null;
};

export type CoupleType = {
  id: string;
  usersId: string[];
  createdAt: string;
  updatedAt: string;
};

const dataPoints = {
  //ссылка на всех пользователей
  users: dataPoint<FirebaseUserType>("users"),
  //ссылка на одного пользователя
  userDoc: (userId: string) =>
    dataPointForOne<FirebaseUserType>("users", userId),
  //на коллекцию событий
  events: dataPoint<CalendarEventType>("events"),
  //на одно событие
  eventDoc: (eventId: string) =>
    dataPointForOne<CalendarEventType>("events", eventId),
  //пары
  couples: dataPoint<CoupleType>("couples"),
  coupleDoc: (coupleId: string) =>
    dataPointForOne<CoupleType>("couples", coupleId),
  //все карточки свиданий
  dateCards: dataPoint<DateCardType>("dateCards"),
  dateCardDoc: (cardId: string) =>
    dataPointForOne<DateCardType>("dateCards", cardId),
  //активные карточки
  activeCoupleCards: dataPoint<ActiveCoupleCardsType>("activeCoupleCards"),
  activeCoupleCardsDoc: (id: string) =>
    dataPointForOne<ActiveCoupleCardsType>("activeCoupleCards", id),
  //сессии свайпов
  swipeSessions: dataPoint<SwipeSessionType>("swipeSessions"),
  swipeSessionDoc: (id: string) =>
    dataPointForOne<SwipeSessionType>("swipeSessions", id),
  //запланированные свидания
  scheduledDates: dataPoint<ScheduledDateType>("scheduledDates"),
  scheduledDateDoc: (id: string) =>
    dataPointForOne<ScheduledDateType>("scheduledDates", id),

  coupleDateCards: (coupleId: string) =>
    query(
      dataPoint<DateCardType>("dateCards"),
      where("coupleId", "==", coupleId)
    ),
  activeCoupleCardsForCouple: (coupleId: string) =>
    query(
      dataPoint<ActiveCoupleCardsType>("activeCoupleCards"),
      where("coupleId", "==", coupleId)
    ),
  activeSwipeSessionsForCouple: (coupleId: string) =>
    query(
      dataPoint<SwipeSessionType>("swipeSessions"),
      where("coupleId", "==", coupleId),
      where("status", "==", "active")
    ),
  scheduledDatesForCouple: (coupleId: string) =>
    query(
      dataPoint<ScheduledDateType>("scheduledDates"),
      where("coupleId", "==", coupleId)
    ),
};

//USER

//один пользователь
export async function getUser(userId: string) {
  const usersSnapshot = await getDoc(dataPoints.userDoc(userId));
  return usersSnapshot.data();
}

//не полностью можно передавать
export async function createUser(user: Partial<FirebaseUserType>) {
  const userId = user.id || v4();
  await setDoc(dataPoints.userDoc(userId), user);

  return userId;
}

async function findUserDocIdByUserId(userId: string) {
  const usersSnapshot = await getDocs(
    query(dataPoints.users, where("id", "==", userId))
  );
  if (usersSnapshot.empty) return null;
  return usersSnapshot.docs[0].id;
}

export async function updateUser(
  userId: string,
  user: Partial<FirebaseUserType>
) {
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

export async function getUserByEmail(email: string) {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const userDoc = querySnapshot.docs[0];
    return { id: userDoc.id, ...userDoc.data() };
  } catch (error) {
    console.error("Ошибка при поиске пользователя по email:", error);
    throw new Error("Ошибка поиска пользователя");
  }
}

export async function getEventsByUserId(
  userId: string
): Promise<CalendarEventType[]> {
  try {
    const eventsQuery = query(
      dataPoints.events,
      where("userIds", "array-contains", userId)
    );

    const querySnapshot = await getDocs(eventsQuery);

    return querySnapshot.docs.map((doc) => doc.data());
  } catch (error) {
    console.error("Ошибка при получении событий пользователя:", error);
    message.error("Не удалось загрузить события");
    throw error;
  }
}

export const createJointEvent = async ({
  event,
  slot,
  userIds,
}: {
  event: DateCardType;
  slot: TimeSlot;
  userIds: string[];
}) => {
  const newEvent: Omit<CalendarEventType, "id"> = {
    summary: `Совместное: ${event.title}`,
    description: `Автоматически создано на основе совпадения\n${
      event.description || ""
    }`,
    start: {
      dateTime: slot.start.toISOString(),
      timeZone: "Europe/Moscow",
    },
    end: {
      dateTime: slot.end.toISOString(),
      timeZone: "Europe/Moscow",
    },
    userIds,
    createdAt: new Date().toISOString(),
    status: "confirmed",
    organizer: {
      email: `${userIds[0]}@yourdomain.com`,
      self: true,
    },
    extendedProperties: {
      private: {
        createdFrom: "swipe-session",
        originalCardId: event.id,
      },
    },
  };

  const docRef = await addDoc(collection(db, "events"), newEvent);
  return docRef.id;
};

export async function createEvent(event: CalendarEventType) {
  const eventId = event.id || event.htmlLink?.split("/").pop() || v4();

  const existingEvent = await getEventById(eventId);

  if (!event.createdBy) {
    throw new Error("Для создания события required поле createdBy");
  }

  if (existingEvent) {
    const existingUserIds = existingEvent.userIds || [];

    if (!existingUserIds.includes(event.createdBy)) {
      await updateDoc(dataPoints.eventDoc(eventId), {
        userIds: [...existingUserIds, event.createdBy],
        updatedAt: new Date().toISOString(),
      });
    }
    return eventId;
  }

  await setDoc(dataPoints.eventDoc(eventId), {
    ...event,
    id: eventId,
    userIds: [event.createdBy],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  return eventId;
}

export async function updateEvent(
  eventId: string,
  updatedEvent: Partial<CalendarEventType>
) {
  await updateDoc(dataPoints.eventDoc(eventId), updatedEvent);
}

export async function deleteEvent(eventId: string) {
  const docRef = dataPoints.eventDoc(eventId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error(`Событие с ID ${eventId} не найдено в Firestore`);
  }

  await deleteDoc(docRef);
}

export function subscribeToUserEvents(
  userId: string,
  dispatch: AppDispatch,
  actionCreator: (events: CalendarEventType[]) => Action
) {
  const q = query(
    collection(db, "events"),
    where("userIds", "array-contains", userId)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const events = snapshot.docs.map((doc) => doc.data() as CalendarEventType);
    dispatch(actionCreator(events));
  });

  return unsubscribe;
}

//COUPLES

export async function createCouple(userId: string) {
  const coupleId = v4();
  const now = new Date().toISOString();

  await setDoc(dataPoints.coupleDoc(coupleId), {
    id: coupleId,
    usersId: [userId],
    createdAt: now,
    updatedAt: now,
  });

  return coupleId;
}

export async function getCoupleById(coupleId: string) {
  const coupleSnapshot = await getDoc(dataPoints.coupleDoc(coupleId));
  return coupleSnapshot.data();
}

export async function addUserToCouple(coupleId: string, userId: string) {
  const couple = await getCoupleById(coupleId);
  if (!couple) {
    throw new Error("Пара не найдена");
  }

  if (couple.usersId.includes(userId)) {
    return; //прльзователь уже в паре
  }

  await updateDoc(dataPoints.coupleDoc(coupleId), {
    usersId: [...couple.usersId, userId],
    updatedAt: new Date().toISOString(),
  });
}

export async function getCoupleByUserIds(userIds: string[]) {
  if (userIds.length !== 2) {
    throw new Error("Необходимо передать ровно два ID пользователя");
  }

  try {
    //пары, где есть первый пользователь
    const couplesQuery = query(
      dataPoints.couples,
      where("usersId", "array-contains", userIds[0])
    );

    const snapshot = await getDocs(couplesQuery);

    //проверяем, есть ли среди этих пар та, где есть второй пользователь
    for (const doc of snapshot.docs) {
      const couple = doc.data();
      if (couple.usersId.includes(userIds[1])) {
        return couple;
      }
    }

    return null;
  } catch (error) {
    console.error("Error finding couple by user IDs:", error);
    throw new Error("Ошибка при поиске пары");
  }
}

export async function getUserCouples(userId: string) {
  try {
    const couplesQuery = query(
      dataPoints.couples,
      where("usersId", "array-contains", userId)
    );

    const querySnapshot = await getDocs(couplesQuery);
    return querySnapshot.docs.map((doc) => doc.data());
  } catch (error) {
    console.error("Error getting user couples:", error);
    throw new Error("Ошибка при получении пар пользователя");
  }
}

export async function updateCouple(
  coupleId: string,
  updates: Partial<Omit<CoupleType, "id">>
) {
  await updateDoc(dataPoints.coupleDoc(coupleId), {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteCouple(coupleId: string) {
  const docRef = dataPoints.coupleDoc(coupleId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error(`Пара с id ${coupleId} не найдена`);
  }

  await deleteDoc(docRef);
}

export function subscribeToUserCouples(userId: string, dispatch: AppDispatch) {
  const couplesQuery = query(
    dataPoints.couples,
    where("usersId", "array-contains", userId)
  );

  const unsubscribe = onSnapshot(couplesQuery, (snapshot) => {
    const couples = snapshot.docs.map((doc) => doc.data());
    // dispatch(action.couplesSlice.setCouples(couples)); сделать
  });

  return unsubscribe;
}

export type ActiveCoupleCardsType = {
  id: string;
  coupleId: string;
  cardIds: string[];
  lastUpdated: string;
};

export type ScheduledDateType = {
  id: string;
  coupleId: string;
  dateCardId: string;
  proposedTime: string;
  status: "pending" | "confirmed" | "rejected" | "cancelled";
  userResponses: {
    [userId: string]: boolean | null;
  };
  createdAt: string;
};

//DATE CARDS OPERATIONS

export async function createDateCard(
  card: Omit<DateCardType, "id" | "createdAt" | "updatedAt">
) {
  const cardId = v4();
  const now = new Date().toISOString();

  if (card.type === "custom" && !card.coupleId) {
    throw new Error("Для custom карточек обязателен coupleId");
  }

  const cardData = {
    ...card,
    id: cardId,
    createdAt: now,
    updatedAt: now,
    coupleId: card.type === "default" ? null : card.coupleId,
  };

  await setDoc(dataPoints.dateCardDoc(cardId), cardData);

  return cardId;
}

export const getDateCard = async (cardId: string) => {
  try {
    const docRef = doc(db, "dateCards", cardId);
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? (snapshot.data() as DateCardType) : null;
  } catch (error) {
    console.error("Error getting date card:", error);
    throw error;
  }
};

export async function getDefaultDateCards() {
  try {
    const defaultCardsQuery = query(
      dataPoints.dateCards,
      where("type", "==", "default")
    );
    const querySnapshot = await getDocs(defaultCardsQuery);

    const defaultCards = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        durationMinutes: data.durationMinutes,
        type: "default" as const,
        coupleId: null, //для default карточек всегда null
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
    });

    return defaultCards;
  } catch (error) {
    console.error("Ошибка загрузки карточек стандартных:", error);
    throw new Error("Не удалось загрузить стандартные карточки");
  }
}

export async function getCoupleDateCards(coupleId: string) {
  const snapshot = await getDocs(dataPoints.coupleDateCards(coupleId));
  return snapshot.docs.map((doc) => doc.data());
}

export async function deleteDateCard(cardId: string) {
  await deleteDoc(dataPoints.dateCardDoc(cardId));
}

//ACTIVE COUPLE CARDS OPERATIONS

export const getActiveCoupleCards = async (
  coupleId: string
): Promise<ActiveCoupleCards | null> => {
  try {
    const q = query(
      collection(db, "activeCoupleCards"),
      where("coupleId", "==", coupleId),
      limit(1)
    );
    const snapshot = await getDocs(q);
    return snapshot.empty
      ? null
      : (snapshot.docs[0].data() as ActiveCoupleCards);
  } catch (error) {
    console.error("ошибка получения активных карточек:", error);
    throw error;
  }
};

export async function createActiveCoupleCards(
  coupleId: string,
  cardIds: string[]
) {
  const id = v4();
  const now = new Date().toISOString();

  await setDoc(dataPoints.activeCoupleCardsDoc(id), {
    id,
    coupleId,
    cardIds,
    lastUpdated: now,
  });

  return id;
}

export async function updateActiveCoupleCards(id: string, cardIds: string[]) {
  await updateDoc(dataPoints.activeCoupleCardsDoc(id), {
    cardIds,
    lastUpdated: new Date().toISOString(),
  });
}

//SWIPE SESSIONS OPERATIONS

export const createSwipeSession = async (
  params: Omit<SwipeSessionType, "id">
): Promise<SwipeSessionType> => {
  try {
    const sessionId = `${params.coupleId}_${Date.now()}`;
    const now = new Date().toISOString();

    const sessionData: SwipeSessionType = {
      id: sessionId,
      ...params,
      status: "active",
      createdAt: now,
      updatedAt: now,
      completedUserIds: [],
      matchedCards: [],
      swipes: {},
    };

    await setDoc(doc(db, "swipeSessions", sessionId), sessionData);
    return sessionData;
  } catch (error) {
    console.error("Error creating swipe session:", error);
    throw error;
  }
};

export const getActiveSwipeSession = async (
  coupleId: string
): Promise<SwipeSessionType | null> => {
  try {
    const q = query(
      collection(db, "swipeSessions"),
      where("coupleId", "==", coupleId),
      where("status", "==", "active"),
      limit(1)
    );
    const snapshot = await getDocs(q);
    return snapshot.empty
      ? null
      : (snapshot.docs[0].data() as SwipeSessionType);
  } catch (error) {
    console.error("Error getting active session:", error);
    throw error;
  }
};

export const getLatestSwipeSession = async (
  coupleId: string
): Promise<SwipeSessionType | null> => {
  try {
    const sessionsRef = collection(db, "swipeSessions");
    const q = query(sessionsRef, where("coupleId", "==", coupleId));

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;

    const sessions = querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as SwipeSessionType)
    );

    const activeSessions = sessions.filter(
      (session) => session.status === "active"
    );

    const sortedSessions = activeSessions.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return sortedSessions[0] || null;
  } catch (error) {
    console.error("getLatestSwipeSession ошибка:", error);
    return null;
  }
};

//SLOTS
export const findAndUpdateMatches = async (
  sessionId: string
): Promise<{
  matchedCards: string[];
  userIds: string[];
} | null> => {
  try {
    const sessionRef = doc(db, "swipeSessions", sessionId);
    const sessionSnap = await getDoc(sessionRef);

    if (!sessionSnap.exists()) {
      throw new Error(`сессия ${sessionId} не найдена`);
    }

    const session = sessionSnap.data() as SwipeSessionType;

    if (!session.completedUserIds || !session.swipes) {
      throw new Error("не валидная сессия");
    }

    if (session.completedUserIds.length < 2) {
      console.debug("не все закончили свайпать");
      return null;
    }

    const [user1Id, user2Id] = session.completedUserIds;
    const user1Choices = session.swipes[user1Id]?.chosenActiveCards || [];
    const user2Choices = session.swipes[user2Id]?.chosenActiveCards || [];

    const user2ChoicesSet = new Set(user2Choices);
    const matchedCards = user1Choices.filter((cardId) =>
      user2ChoicesSet.has(cardId)
    );

    const newStatus =
      matchedCards.length > 0 ? "matchesFound" : "noMatchesFound";

    const updateData: Partial<SwipeSessionType> = {
      matchedCards,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    console.log(`обновление сессии ${sessionId}:`, {
      matchesCount: matchedCards.length,
      newStatus,
    });

    await updateDoc(sessionRef, updateData);

    return {
      matchedCards,
      userIds: session.completedUserIds,
    };
  } catch (error) {
    console.error(`нету мэтчей по сессии ${sessionId}:`, error);

    if (error instanceof FirebaseError) {
      throw new Error("ошибка бд: " + error.message);
    }

    throw error;
  }
};

export const updateUserSwipes = async (
  sessionId: string,
  userId: string,
  chosenCards: string[],
  declinedCards: string[]
): Promise<void> => {
  try {
    const sessionRef = doc(db, "swipeSessions", sessionId);
    const sessionSnap = await getDoc(sessionRef);

    if (!sessionSnap.exists()) {
      throw new Error(`сессия ${sessionId} не найдена`);
    }

    const sessionData = sessionSnap.data() as SwipeSessionType;

    const userSwipes = sessionData.swipes?.[userId] || {
      chosenActiveCards: [],
      declinedActiveCards: [],
    };

    const updates: Partial<SwipeSessionType> = {
      updatedAt: new Date().toISOString(),
      [`swipes.${userId}`]: {
        chosenActiveCards: arrayUnion(
          ...(userSwipes.chosenActiveCards || []),
          ...chosenCards
        ),
        declinedActiveCards: arrayUnion(
          ...(userSwipes.declinedActiveCards || []),
          ...declinedCards
        ),
      },
    };

    await updateDoc(sessionRef, updates);
  } catch (error) {
    console.error("ошибка обновления свайпов", error);
    throw error;
  }
};

export const markUserCompletedSwipes = async (
  sessionId: string,
  userId: string
): Promise<void> => {
  try {
    await updateDoc(doc(db, "swipeSessions", sessionId), {
      completedUserIds: arrayUnion(userId),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("ошибка при markUserCompletedSwipes:", error);
    throw error;
  }
};

export const getArchivedSwipeSessions = async (
  coupleId: string
): Promise<SwipeSessionType[]> => {
  try {
    const q = query(
      collection(db, "swipeSessions"),
      where("coupleId", "==", coupleId),
      where("status", "==", "archived")
    );
    const snapshot = await getDocs(q);
    const sessions = snapshot.docs.map((doc) => doc.data() as SwipeSessionType);

    return sessions;
  } catch (error) {
    console.error("Error getting archived sessions:", error);
    return [];
  }
};

//SCHEDULED DATES OPERATIONS

export async function createScheduledDate(params: {
  coupleId: string;
  dateCardId: string;
  proposedTime: string;
  userIds: string[];
}) {
  const id = v4();
  const now = new Date().toISOString();

  //инициализируются ответы пользователей как null
  const userResponses = params.userIds.reduce((acc, userId) => {
    acc[userId] = null;
    return acc;
  }, {} as Record<string, null>);

  await setDoc(dataPoints.scheduledDateDoc(id), {
    id,
    coupleId: params.coupleId,
    dateCardId: params.dateCardId,
    proposedTime: params.proposedTime,
    status: "pending",
    userResponses,
    createdAt: now,
  });

  return id;
}

export async function getScheduledDates(coupleId: string) {
  const snapshot = await getDocs(dataPoints.scheduledDatesForCouple(coupleId));
  return snapshot.docs.map((doc) => doc.data());
}

export async function updateScheduledDateResponse(
  dateId: string,
  userId: string,
  response: boolean
) {
  const dateRef = dataPoints.scheduledDateDoc(dateId);
  const dateSnap = await getDoc(dateRef);

  if (!dateSnap.exists()) throw new Error("Свидание не найдено");

  const updates = {
    [`userResponses.${userId}`]: response,
    updatedAt: new Date().toISOString(),
  };

  // Проверяем все ли ответили и обновляем статус
  const data = dateSnap.data();
  const allResponses = Object.values({
    ...data.userResponses,
    [userId]: response,
  });

  if (allResponses.every((val) => val !== null)) {
    updates.status = allResponses.every((val) => val)
      ? "confirmed"
      : "rejected";
  }

  await updateDoc(dateRef, updates);
}

export async function cancelScheduledDate(dateId: string) {
  await updateDoc(dataPoints.scheduledDateDoc(dateId), {
    status: "cancelled",
    updatedAt: new Date().toISOString(),
  });
}

//SUBSCRIPTIONS

export const subscribeToSession = (
  sessionId: string,
  callback: (session: SwipeSessionType | null) => void,
  onCompletion?: () => void
) => {
  return onSnapshot(doc(db, "swipeSessions", sessionId), (doc) => {
    const session = doc.exists() ? (doc.data() as SwipeSessionType) : null;
    callback(session);

    if (session?.completedUserIds.length === 2 && onCompletion) {
      onCompletion();
    }
  });
};

export function subscribeToActiveCoupleCards(
  coupleId: string,
  callback: (data: ActiveCoupleCardsType | null) => void
) {
  const q = dataPoints.activeCoupleCardsForCouple(coupleId);

  return onSnapshot(q, (snapshot) => {
    callback(snapshot.empty ? null : snapshot.docs[0].data());
  });
}

export function subscribeToActiveSwipeSession(
  coupleId: string,
  callback: (session: SwipeSessionType | null) => void
) {
  const q = dataPoints.activeSwipeSessionsForCouple(coupleId);

  return onSnapshot(q, (snapshot) => {
    callback(snapshot.empty ? null : snapshot.docs[0].data());
  });
}

export function subscribeToScheduledDates(
  coupleId: string,
  callback: (dates: ScheduledDateType[]) => void
) {
  const q = dataPoints.scheduledDatesForCouple(coupleId);

  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((doc) => doc.data()));
  });
}

export const setupSessionListener = (sessionId: string) => {
  const sessionRef = doc(db, "swipeSessions", sessionId);

  const unsubscribe = onSnapshot(sessionRef, async (doc) => {
    const session = doc.data() as SwipeSessionType;

    if (!session) return;

    if (session.completedUserIds.length === 2 && session.status === "active") {
      await findAndUpdateMatches(sessionId);
      unsubscribe();
    }
  });

  return unsubscribe;
};
