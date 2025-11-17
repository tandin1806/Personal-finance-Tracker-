from rest_framework import serializers
from .models import Budget

class BudgetSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Budget
        fields = [
            'id', 'category', 'category_name', 'limit', 'period', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['user']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)