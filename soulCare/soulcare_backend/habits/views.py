# from rest_framework import generics, status
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated
# from .models import Habit
# from .serializers import HabitSerializer
# import random
# from datetime import date

# class HabitListCreate(generics.ListCreateAPIView):
#     serializer_class = HabitSerializer
#     permission_classes = [IsAuthenticated]

#     def get_queryset(self):
#         """
#         Returns habits for the logged-in user.
#         """
#         # Daily reset logic: check and update `completed_today`
#         # This is more efficient than a cron job for a smaller app
#         today = date.today()
#         # Find all habits where last_completed_date is not today
#         habits_to_reset = self.request.user.habits.exclude(last_completed_date=today)
#         for habit in habits_to_reset:
#             if habit.completed_today:
#                 habit.completed_today = False
#                 habit.save()

#         return self.request.user.habits.all().order_by('-created_at')

#     def perform_create(self, serializer):
#         """
#         Saves the new habit, linking it to the user and setting a color.
#         """
#         color = f'hsl({random.randint(0, 360)}, 70%, 50%)'
#         serializer.save(user=self.request.user, color=color)

# class HabitDetail(generics.RetrieveDestroyAPIView):
#     queryset = Habit.objects.all()
#     serializer_class = HabitSerializer
#     permission_classes = [IsAuthenticated]

#     def get_queryset(self):
#         return self.request.user.habits.all()

#     def perform_destroy(self, instance):
#         instance.delete()

# class HabitToggleCompletion(APIView):
#     permission_classes = [IsAuthenticated]

#     def put(self, request, pk):
#         try:
#             habit = Habit.objects.get(pk=pk, user=request.user)
#         except Habit.DoesNotExist:
#             return Response({'error': 'Habit not found'}, status=status.HTTP_404_NOT_FOUND)
        
#         is_completed = not habit.completed_today
#         habit.completed_today = is_completed

#         if is_completed:
#             habit.current += 1
#             habit.check_and_update_streak()
#         else:
#             habit.uncomplete_habit()

#         serializer = HabitSerializer(habit)
#         return Response(serializer.data, status=status.HTTP_200_OK)