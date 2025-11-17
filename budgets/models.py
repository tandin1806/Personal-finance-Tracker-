from django.db import models
from django.contrib.auth import get_user_model
from expenses.models import ExpenseCategory

User = get_user_model()

class Budget(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    category = models.ForeignKey(ExpenseCategory, on_delete=models.CASCADE)
    limit = models.DecimalField(max_digits=10, decimal_places=2)
    period = models.CharField(max_length=20, choices=[
        ('monthly', 'Monthly'),
        ('weekly', 'Weekly'),
        ('yearly', 'Yearly')
    ], default='monthly')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'category', 'period']

    def __str__(self):
        return f"{self.category.name} - Nu. {self.limit} ({self.period})"