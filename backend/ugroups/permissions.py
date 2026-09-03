from rest_framework import permissions


class EhLiderDoUGroup(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        usuario = request.user
        if usuario.role in ('apostolo', 'pastor_presidente'):
            return True
        ugroup = obj if hasattr(obj, 'lideres') else getattr(obj, 'ugroup', None) or obj.encontro.ugroup
        return usuario in ugroup.lideres.all()