from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework import serializers, status
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from rest_framework_simplejwt.serializers import TokenObtainSerializer
from rest_framework_simplejwt.tokens import RefreshToken, UntypedToken

User = get_user_model()


class InActiveUser(AuthenticationFailed):
    status_code = status.HTTP_406_NOT_ACCEPTABLE
    default_detail = "User is not active, please confirm your email"
    default_code = "user_is_inactive"


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ("id", "email", "password", "created_at", "is_active", "is_staff")
        read_only_fields = ("id", "created_at", "is_active", "is_staff")

    def validate(self, data):
        password = data.get("password")

        errors = dict()
        try:
            validate_password(password, self.Meta.model)
        except ValidationError as e:
            errors["password"] = list(e.messages)

        if errors:
            raise serializers.ValidationError(errors)
        return super(UserSerializer, self).validate(data)

    def create(self, validated_data):
        password = validated_data.pop("password", None)

        instance = self.Meta.model.objects.create_user(
            **validated_data, password=password
        )

        return instance


# Cookie JWT


class CustomTokenObtainPairSerializer(TokenObtainSerializer):
    username_field = "email"

    @classmethod
    def get_token(cls, user):
        return RefreshToken.for_user(user)

    def validate(self, attrs):
        data = super().validate(attrs)
        if not self.user.is_active:
            raise InActiveUser()

        refresh = self.get_token(self.user)

        data["refresh"] = str(refresh)
        data["access"] = str(refresh.access_token)

        return data


class CustomTokenVerifySerializer(serializers.Serializer):
    token = serializers.CharField(required=False)

    def validate(self, attrs):
        if not attrs.get("token"):
            raise serializers.ValidationError("No token provided")

        UntypedToken(attrs["token"])

        return {}
