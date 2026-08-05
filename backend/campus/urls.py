from rest_framework.routers import DefaultRouter
from .views import CampusViewSet

router = DefaultRouter()
router.register('campus', CampusViewSet, basename='campus')

urlpatterns = router.urls