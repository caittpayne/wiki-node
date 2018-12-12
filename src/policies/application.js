module.exports = class ApplicationPolicy {
    constructor(user, record) {
        this.user = user;
        this.record = record;
    }

    _isOwner() {
        if(this.user) {
            return this.record && (this.record.userId == this.user.id);  
        }
        return false;
    }

    _isAdmin() {
        return this.user && this.user.role == 'admin';
    }

    _isPremium() {
        return this.user && this.user.role == 'premium';
    }

    _isCollaborator() {
    }

    new() {
        return this.user != null;
    }

    create() {
        return this.new();
    }

    show() {
        return true;
    }

    edit() {
        return this.new();
    }

    update() {
        return this.edit();
    }

    destroy() {
        return this._isOwner() || this._isAdmin();
    }
}