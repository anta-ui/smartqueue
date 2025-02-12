from rest_framework import serializers
from django.contrib.gis.geos import Point, Polygon
from django.utils.translation import gettext_lazy as _
from .models import (
    UserLocation, GeofencingZone, GeofencingEvent,
    LocationBasedService, ProximityAlert
)

class UserLocationSerializer(serializers.ModelSerializer):
    latitude = serializers.FloatField(write_only=True)
    longitude = serializers.FloatField(write_only=True)
    coordinates = serializers.SerializerMethodField()

    class Meta:
        model = UserLocation
        fields = '__all__'
        read_only_fields = ['user']

    def get_coordinates(self, obj):
        return {
            'latitude': obj.location.y,
            'longitude': obj.location.x
        }

    def create(self, validated_data):
        latitude = validated_data.pop('latitude')
        longitude = validated_data.pop('longitude')
        validated_data['location'] = Point(longitude, latitude)
        return super().create(validated_data)

class GeofencingZoneSerializer(serializers.ModelSerializer):
    coordinates = serializers.ListField(
        child=serializers.ListField(
            child=serializers.ListField(
                child=serializers.FloatField()
            )
        ),
        write_only=True
    )
    bounds = serializers.SerializerMethodField()

    class Meta:
        model = GeofencingZone
        fields = '__all__'
        read_only_fields = ['organization']

    def get_bounds(self, obj):
        bounds = obj.polygon.extent
        return {
            'southwest': {'longitude': bounds[0], 'latitude': bounds[1]},
            'northeast': {'longitude': bounds[2], 'latitude': bounds[3]}
        }

    def create(self, validated_data):
        coordinates = validated_data.pop('coordinates')
        validated_data['polygon'] = Polygon(coordinates[0])
        return super().create(validated_data)

class GeofencingEventSerializer(serializers.ModelSerializer):
    zone_name = serializers.CharField(source='zone.name', read_only=True)
    coordinates = serializers.SerializerMethodField()

    class Meta:
        model = GeofencingEvent
        fields = '__all__'
        read_only_fields = ['user', 'zone', 'location', 'timestamp']

    def get_coordinates(self, obj):
        return {
            'latitude': obj.location.y,
            'longitude': obj.location.x
        }

class LocationBasedServiceSerializer(serializers.ModelSerializer):
    coordinates = serializers.SerializerMethodField()
    distance = serializers.SerializerMethodField()

    class Meta:
        model = LocationBasedService
        fields = '__all__'
        read_only_fields = ['organization', 'current_load']

    def get_coordinates(self, obj):
        return {
            'latitude': obj.location.y,
            'longitude': obj.location.x
        }

    def get_distance(self, obj):
        request = self.context.get('request')
        if request and hasattr(request.user, 'locations'):
            last_location = request.user.locations.order_by('-timestamp').first()
            if last_location:
                return obj.location.distance(last_location.location) * 100000  # Convert to meters
        return None

    def validate_operating_hours(self, value):
        days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        if not isinstance(value, dict):
            raise serializers.ValidationError(_('Operating hours must be a dictionary.'))
        
        for day in value.keys():
            if day.lower() not in days:
                raise serializers.ValidationError(_(f'Invalid day: {day}'))
            
            hours = value[day]
            if not isinstance(hours, list):
                raise serializers.ValidationError(_(f'Hours for {day} must be a list.'))
            
            for slot in hours:
                if not isinstance(slot, dict) or 'open' not in slot or 'close' not in slot:
                    raise serializers.ValidationError(
                        _(f'Each time slot must have open and close times.')
                    )
        return value

class ProximityAlertSerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(source='service.name', read_only=True)

    class Meta:
        model = ProximityAlert
        fields = '__all__'
        read_only_fields = ['user', 'triggered_at', 'resolved_at']

    def validate(self, data):
        if data.get('alert_type') == ProximityAlert.AlertType.CUSTOM and not data.get('custom_radius'):
            raise serializers.ValidationError(
                _('Custom radius is required for custom alerts.')
            )
        return data
