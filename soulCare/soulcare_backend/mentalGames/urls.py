from django.urls import path

from .views import ReactionTimeResultListCreateView,MemoryGameResultListCreateView, StroopGameResultListCreateView,LongestNumberGameResultListCreateView,NumpuzGameResultListCreateView,numpuz_stats_view,longest_number_stats_view,AdditionsGameResultListCreateView,additions_stats_view,dashboard_stats_view,export_all_game_data_csv
urlpatterns = [
    # The view is a Class-Based View, so we call .as_view()
    path('reaction-time/', ReactionTimeResultListCreateView.as_view(), name='reaction-time-results'),
    path('memory-game/', MemoryGameResultListCreateView.as_view(), name='memory-game-results'),
    path('stroop-game/', StroopGameResultListCreateView.as_view(), name='stroop-game-results'),
    path('longest-number/', LongestNumberGameResultListCreateView.as_view(), name='longest-number-list-create'),
    path('longest-number-stats/', longest_number_stats_view, name='longest-number-stats'),
    path('export-all-data/', export_all_game_data_csv, name='export-all-game-data-csv'),
    path('numpuz-game/', NumpuzGameResultListCreateView.as_view(), name='numpuz-game-list-create'),
    path('numpuz-stats/', numpuz_stats_view, name='numpuz-stats'),
    path('additions-game/', AdditionsGameResultListCreateView.as_view(), name='additions-game-list-create'),
    path('additions-stats/', additions_stats_view, name='additions-stats'),
    path('dashboard-stats/', dashboard_stats_view, name='dashboard-stats'),


]
