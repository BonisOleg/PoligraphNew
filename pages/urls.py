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
    path('legal/<slug:slug>/', views.legal_document_view, name='legal'),
]




