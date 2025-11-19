from django.urls import path
from .views import ReactionTimeResultListCreateView,MemoryGameResultListCreateView, StroopGameResultListCreateView, export_all_game_data_csv
urlpatterns = [
    # The view is a Class-Based View, so we call .as_view()
    path('reaction-time/', ReactionTimeResultListCreateView.as_view(), name='reaction-time-results'),
    path('memory-game/', MemoryGameResultListCreateView.as_view(), name='memory-game-results'),
    path('stroop-game/', StroopGameResultListCreateView.as_view(), name='stroop-game-results'),
    path('export-all-data/', export_all_game_data_csv, name='export-all-game-data-csv'),


]
