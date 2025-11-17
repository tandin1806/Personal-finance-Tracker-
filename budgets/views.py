from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum
from .models import Budget
from .serializers import BudgetSerializer

class BudgetViewSet(viewsets.ModelViewSet):
    serializer_class = BudgetSerializer
    queryset = Budget.objects.all()
    
    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user).select_related('category')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)