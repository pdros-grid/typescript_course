enum HTTPStatus {
  OK = 200,
  INTERNAL_SERVER_ERROR = 500,
}

type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

type HTTPRequest = {
  method: HTTPMethod;
  host: string;
  path: string;
  body?: unknown;
  params: unknown;
};

type HTTPResponse = {
  status: HTTPStatus;
};

type UserRole = 'admin' | 'user';

type User = {
  name: string;
  age: number;
  roles: UserRole[];
  createdAt: Date;
  isDeleted: boolean;
};

type Handlers = {
  next?: (request: HTTPRequest) => HTTPResponse;
  error?: (error: unknown) => HTTPResponse;
  complete?: () => void;
};

class Observer {
  private isUnsubscribed = false;
  public _unsubscribe?: (observer?: Observer) => void;

  constructor(private handlers: Handlers) {}

  next(value: HTTPRequest) {
    if (this.handlers.next && !this.isUnsubscribed) {
      this.handlers.next(value);
    }
  }

  error(error: unknown) {
    if (!this.isUnsubscribed) {
      if (this.handlers.error) {
        this.handlers.error(error);
      }

      this.unsubscribe();
    }
  }

  complete() {
    if (!this.isUnsubscribed) {
      if (this.handlers.complete) {
        this.handlers.complete();
      }

      this.unsubscribe();
    }
  }

  unsubscribe() {
    this.isUnsubscribed = true;

    if (this._unsubscribe) {
      this._unsubscribe();
    }
  }
}

class Observable {
  constructor(private _subscribe: (observer: Observer) => () => void | void) {}

  static from(values: HTTPRequest[]): Observable {
    return new Observable((observer) => {
      values.forEach((value) => observer.next(value));

      observer.complete();

      return () => {
        console.log('unsubscribed');
      };
    });
  }

  subscribe(obs: Handlers) {
    const observer = new Observer(obs);

    observer._unsubscribe = this._subscribe(observer);

    return {
      unsubscribe() {
        observer.unsubscribe();
      },
    };
  }
}

const userMock: User = {
  name: 'User Name',
  age: 26,
  roles: ['user', 'admin'],
  createdAt: new Date(),
  isDeleted: false,
};

const requestsMock: HTTPRequest[] = [
  {
    method: 'POST',
    host: 'service.example',
    path: 'user',
    body: userMock,
    params: {},
  },
  {
    method: 'GET',
    host: 'service.example',
    path: 'user',
    params: {
      id: '3f5h67s4s',
    },
  },
];

const handleRequest = (request: HTTPRequest) => {
  // handling of request
  return { status: HTTPStatus.OK };
};
const handleError = (error: unknown) => {
  // handling of error
  return { status: HTTPStatus.INTERNAL_SERVER_ERROR };
};

const handleComplete = () => console.log('complete');

const requests$ = Observable.from(requestsMock);

const subscription = requests$.subscribe({
  next: handleRequest,
  error: handleError,
  complete: handleComplete,
});

subscription.unsubscribe();
