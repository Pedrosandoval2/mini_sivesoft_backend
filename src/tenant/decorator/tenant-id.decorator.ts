import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

/**
 * Decorador personalizado para extraer el tenantId del JWT
 * 
 * Este decorador obtiene automáticamente el tenantId del token JWT del usuario autenticado.
 * No requiere headers adicionales, la información se obtiene únicamente del Bearer token.
 * 
 * @example
 * ```typescript
 * @Get()
 * findAll(@TenantId() tenantId: string) {
 *   return this.service.findAll(tenantId);
 * }
 * ```
 * 
 * El tenantId proviene del payload del JWT:
 * - Al hacer login, el usuario recibe un token con tenantId (por defecto el primero de su lista)
 * - Al hacer switch-tenant, recibe un nuevo token con el tenantId seleccionado
 * - Todas las peticiones subsecuentes usan ese tenantId del token actual
 */
export const TenantId = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): string => {
        const request = ctx.switchToHttp().getRequest();
        
        // Obtener el tenantId del JWT (viene del token de autenticación)
        const tenantId = request.user?.tenantId;
        
        if (!tenantId) {
            throw new UnauthorizedException(
                'Tenant ID no encontrado en el token. Por favor, inicia sesión nuevamente.'
            );
        }
        
        return tenantId;
    },
);
