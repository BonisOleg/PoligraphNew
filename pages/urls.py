"""
URL configuration для pages app.
"""

from django.urls import path
from . import views

app_name = 'pages'

urlpatterns = [
    path('', views.index_view, name='index'),
    path('about/', views.about_view, name='about'),
    path('contacts/', views.contacts_view, name='contacts'),
    path('consultation/', views.consultation_view, name='consultation'),
    path('perevirka-na-zradu/', views.infidelity_landing_view, name='infidelity_landing'),
    path('perevirka-na-zradu/submit/', views.infidelity_form_submit, name='infidelity_submit'),
    path('korporatyvni-poslugy/', views.corporate_landing_view, name='corporate_landing'),
    path('korporatyvni-poslugy/submit/', views.corporate_form_submit, name='corporate_submit'),
    path('legal/<slug:slug>/', views.legal_document_view, name='legal'),
    path('health/', views.health_check, name='health'),
    path('favicon.ico', views.favicon_view, name='favicon'),
    path('robots.txt', views.robots_txt, name='robots'),
    path('sw.js', views.sw_js, name='sw'),
]




