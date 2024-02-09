from typing import Callable

from common.singleton import SingletonMeta


class EventBus(metaclass=SingletonMeta):
    def __init__(self):
        self.listeners = {}

    def listener(self, event_type: str):
        def wrapper(func: Callable):
            if event_type not in self.listeners:
                self.listeners[event_type] = []
            self.listeners[event_type].append(func)
            return func

        return wrapper

    def emit(self, event_type: str, *args, **kwargs):
        def invoke_listeners():
            if event_type in self.listeners:
                for listener in self.listeners[event_type]:
                    listener(*args, **kwargs)

        invoke_listeners()


bus = EventBus()
