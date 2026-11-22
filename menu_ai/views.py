import json
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import ensure_csrf_cookie
from .generator import generate_items
from .models import SavedMenu

@ensure_csrf_cookie
def home(request):
    return render(request, 'menu_ai/home.html')

@require_POST
def generate(request):
    try:
        payload = json.loads(request.body or '{}')
        category = payload.get('category', 'Основные блюда')
        payload['prompt'] = str(payload.get('prompt', '')).strip()[:600]
        items = generate_items(
            category,
            max(1, min(int(payload.get('count', 3)), 5)),
            payload.get('season', ''),
            payload.get('vibe', ''),
            payload.get('venue', ''),
            prompt=payload['prompt'],
            inspiration=payload.get('inspiration', False) in (True, 1, 'true', '1', 'on'),
        )
        # The local library is always available; adding a key enables Gemini enrichment.
        from django.conf import settings
        if settings.GEMINI_API_KEY:
            try:
                from .generator import enrich_with_gemini
                items = enrich_with_gemini(items, payload, settings.GEMINI_API_KEY)
            except Exception:
                pass
        inspiration = payload.get('inspiration', False) in (True, 1, 'true', '1', 'on')
        for item in items:
            item.setdefault('category', category)
            item['choice'] = inspiration
            if inspiration:
                item['category'] = 'Выбор Ками 🤍'
        return JsonResponse({'items': items})
    except (ValueError, TypeError, json.JSONDecodeError):
        return JsonResponse({'error': 'Проверьте параметры генерации.'}, status=400)

@require_POST
def save_item(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Войдите, чтобы сохранить позицию.'}, status=401)
    try:
        data = json.loads(request.body)
        item = SavedMenu.objects.create(user=request.user, name=data['name'], description=data['description'], price=int(data['price']), nutrition=data.get('nutrition',''), social_post=data.get('social_post',''), category=data.get('category',''))
        return JsonResponse({'ok': True, 'id': item.id})
    except (KeyError, TypeError, ValueError, json.JSONDecodeError):
        return JsonResponse({'error': 'Не удалось сохранить позицию.'}, status=400)

def register(request):
    form = UserCreationForm(request.POST or None)
    if request.method == 'POST' and form.is_valid():
        user = form.save()
        login(request, user)
        messages.success(request, f'Аккаунт создан. Рады видеть вас, {user.username}!')
        return redirect('home')
    return render(request, 'menu_ai/auth.html', {'form': form, 'title': 'Создать аккаунт', 'submit': 'Зарегистрироваться'})

def login_view(request):
    form = AuthenticationForm(request, data=request.POST or None)
    if request.method == 'POST' and form.is_valid():
        user = authenticate(request, username=form.cleaned_data.get('username'), password=form.cleaned_data.get('password'))
        if user is not None:
            login(request, user)
            messages.success(request, f'С возвращением, {user.username}!')
            return redirect(request.GET.get('next') or 'home')
    return render(request, 'menu_ai/auth.html', {'form': form, 'title': 'С возвращением', 'submit': 'Войти', 'is_login': True})

def logout_view(request):
    if request.method == 'POST': logout(request)
    return redirect('home')

@login_required
def my_menu(request):
    return render(request, 'menu_ai/my_menu.html', {'items': request.user.saved_menu_items.all()})

@login_required
@require_POST
def delete_item(request, item_id):
    item = get_object_or_404(SavedMenu, id=item_id, user=request.user)
    item.delete(); messages.success(request, 'Позиция удалена из вашего меню.')
    return redirect('my_menu')
