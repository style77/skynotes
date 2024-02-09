from functools import wraps


class EventBus:
    listeners = {}

    def listener(self, event_type):
        @wraps
        def wrapper(func):
            if event_type not in self.listeners:
                self.listeners[event_type] = []
            self.listeners[event_type].append(func)
            return func

        return wrapper

    def emit(self, event_type, *args, **kwargs):
        emit_after = kwargs.pop(
            "after", False
        )  # if the event should be dispatched before or after the function execute

        def invoke_listeners():
            if event_type in self.listeners:
                for listener in self.listeners[event_type]:
                    listener(*args, **kwargs)

        if emit_after:

            def decorator(func):
                @wraps(func)
                def wrapper(*func_args, **func_kwargs):
                    result = func(
                        *func_args, **func_kwargs
                    )  # Execute the decorated function first
                    invoke_listeners()  # Then invoke listeners
                    return result

                return wrapper

            return decorator
        else:
            invoke_listeners()


bus = EventBus()
