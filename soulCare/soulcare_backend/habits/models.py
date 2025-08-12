# from django.db import models
# from django.contrib.auth.models import User
# from datetime import date, timedelta

# class Habit(models.Model):
#     FREQUENCY_CHOICES = [
#         ('daily', 'Daily'),
#         ('weekly', 'Weekly'),
#         ('monthly', 'Monthly'),
#     ]

#     user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='habits')
#     name = models.CharField(max_length=100)
#     description = models.TextField(blank=True, null=True)
#     frequency = models.CharField(max_length=10, choices=FREQUENCY_CHOICES, default='daily')
#     target = models.IntegerField(default=1)
#     current = models.IntegerField(default=0)
#     streak = models.IntegerField(default=0)
#     best_streak = models.IntegerField(default=0)
#     category = models.CharField(max_length=50)
#     color = models.CharField(max_length=20) # e.g., "#RRGGBB" or "hsl(...)"
#     completed_today = models.BooleanField(default=False)
#     last_completed_date = models.DateField(null=True, blank=True)
#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return self.name

#     def check_and_update_streak(self):
#         """
#         Logic to check and update the streak based on last_completed_date.
#         """
#         today = date.today()
#         yesterday = today - timedelta(days=1)

#         if self.last_completed_date == yesterday:
#             self.streak += 1
#         elif self.last_completed_date != today:
#             self.streak = 1
        
#         if self.streak > self.best_streak:
#             self.best_streak = self.streak

#         self.last_completed_date = today
#         self.save()

#     def uncomplete_habit(self):
#         """
#         Logic to handle uncompleting a habit.
#         """
#         if self.last_completed_date == date.today():
#             self.current = max(0, self.current - 1)
#             # The streak logic for uncompleting is complex. For simplicity,
#             # we'll just decrement the streak. A more robust solution might
#             # re-calculate the streak based on completion history.
#             self.streak = max(0, self.streak - 1)
#             self.last_completed_date = None # You could store a log of completions instead
#         self.save()