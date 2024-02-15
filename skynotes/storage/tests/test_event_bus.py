from common.bus import EventBus
from unittest import TestCase


class TestEventBus(TestCase):
    def setUp(self):
        self.bus = EventBus()

    def test_bus_singleton(self):
        another_bus = EventBus()
        self.assertIs(self.bus, another_bus)

    def test_bus(self):
        # Test registering a listener and emitting an event
        result = []

        def handler(event):
            result.append(event)

        self.bus.register_listener("test_event", handler)
        self.bus.emit("test_event", "test")
        self.assertEqual(result, ["test"])

    def test_bus_decorator(self):
        # Test registering a listener using the decorator syntax
        result = []

        @self.bus.listener("test_event")
        def handler(event):
            result.append(event)

        self.bus.emit("test_event", "test")
        self.assertEqual(result, ["test"])

    def test_multiple_listeners(self):
        # Test registering multiple listeners for the same event
        result = []

        def handler1(event):
            result.append(event + "_handler1")

        def handler2(event):
            result.append(event + "_handler2")

        self.bus.register_listener("test_event", handler1)
        self.bus.register_listener("test_event", handler2)

        self.bus.emit("test_event", "test")
        self.assertEqual(result, ["test_handler1", "test_handler2"])

    def test_unregistered_event(self):
        self.bus.emit("unregistered_event", "test")
