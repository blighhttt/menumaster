from django.contrib import admin
from .models import SavedMenu

@admin.register(SavedMenu)
class SavedMenuAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'price', 'category', 'created_at')
    search_fields = ('name', 'user__username', 'category')
