import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
    state: () => ({
        user: null,
        roleName: null,
        roles : [
            {id: 1, name: 'Usuari'},
            {id: 2, name: 'Administrador'},
            {id: 3, name: 'Superadmin'},
        ],
    }),
    getters: {
        hasAdminRole() {
            return this.roleName == 'Administrador' || this.roleName == 'Superadmin';
        },
        hasSuperadminRole() {
            return this.roleName == 'Superadmin';
        },
    },
    actions: {
        async setUser(userData) {
            this.user = userData;
            if (this.user) {
                await this.setRole(this.user.role_id);
            }
        },
        async setRole(roleId) {
            this.roleName = this.roles.find(role => role.id === roleId).name;
        },
    },
});
