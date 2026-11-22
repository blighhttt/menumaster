from django.conf import settings
from django.db import models


class SavedMenu(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="saved_menu_items")
    name = models.CharField(max_length=160)
    description = models.TextField()
    price = models.PositiveIntegerField()
    nutrition = models.CharField(max_length=100, blank=True)
    social_post = models.TextField(blank=True)
    category = models.CharField(max_length=80, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} · {self.user}"
