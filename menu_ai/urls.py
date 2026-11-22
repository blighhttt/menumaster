from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('api/generate/', views.generate, name='generate'),
    path('api/save/', views.save_item, name='save_item'),
    path('accounts/register/', views.register, name='register'),
    path('accounts/login/', views.login_view, name='login'),
    path('accounts/logout/', views.logout_view, name='logout'),
    path('my-menu/', views.my_menu, name='my_menu'),
    path('my-menu/<int:item_id>/delete/', views.delete_item, name='delete_item'),
]
