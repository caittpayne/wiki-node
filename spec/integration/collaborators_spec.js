const request = require('request');
const server = require('../../src/server');
const base = 'http://localhost:3000/wikis/';

const sequelize = require('../../src/db/models/index').sequelize;
const Wiki = require('../../src/db/models').Wiki;
const User = require('../../src/db/models').User;
const Collaborator = require('../../src/db/models').Collaborator;


describe('routes : collaborators', () => {
    beforeEach((done) => {
        this.user;
        this.wiki;
        this.collaborator;

        sequelize.sync({force: true}).then((res) => {
            User.create({
                email: "john.snow@got.com",
                password: "12345678910",
                name: "John Snow",
                role: 'private'
            }, {
                email: "arya.stark@got.com",
                password: '123456789',
                name: 'Arya Stark',
                role: 'standard'
            })
            .then((users) => {
                john = users[0];
                arya = users[1];

                Wiki.create({
                    title: 'Expeditions to north of the wall',
                    body: 'A compilation of reports from recent visits to the north',
                    userId: john,
                    private: true
                })
                .then((wiki) => {
                    this.wiki = wiki;

                    Collaborator.create({
                        userId: arya,
                        name: arya.name,
                        wikiId: this.wiki.id
                    })
                    .then((collaborator) => {
                        this.collaborator = collaborator;
                        done();
                    })
                    .catch((err) => {
                        console.log(err);
                        done();
                    });
                })
                .catch((err) => {
                    console.log(err);
                    done();
                });
            });
        });
    });
    
    describe('guest attempting to perform CRUD actions for Collaborator', () => {
        beforeEach((done) => {
            request.get({
                url: 'http://localhost:3000/auth/fake',
                form: {
                    userId: 0
                }
            }, (err, res, body) => {
                done();
            });
        });
        describe('GET /wikis/:id/collaborators', () => {
            it('should not render a view to add collaborators', (done) => {
                request.get(`${base}${this.wiki.id}/collaborators`, (err, res, body) => {
                    expect(body).not.toContain('Add Collaborators');
                    done();
                })
            })
        })
        describe('POST /wikis/:id/collaborators/add', () => {
            it('should not create new collaborator(s)', (done) => {
                const options = {
                    url: `${base}${this.wiki.id}/collaborators/add`,
                    form: {
                        userId: 1,
                        name: 'John Snow',
                        wikiId: this.wiki.id
                    }
                };
                request.post(options, (err, res, body) => {
                    Collaborator.findOne({where: {userId: 1}})
                    .then((collaborator) => {
                        expect(collaborator).toBeNull();
                        done();
                    })
                    .catch((err) => {
                        console.log(err);
                        done();
                    });
                });
            });
        });
        describe('POST /wikis/:wikiId/collaborators/:id/destroy', () => {
            it('should not delete the collaborator with the associated ID', (done) => {
                Collaborator.all()
                .then((collaborators) => {
                    const collabCountBeforeDelete = collaborators.length;

                    expect(collabCountBeforeDelete).toBe(1);

                    request.post(
                        `${base}${this.wiki.id}/collaborators/${this.collaborator.id}/destroy`, (err, res, body) => {
                            Collaborator.all()
                            .then((collaborators) => {
                                expect(err).toBeNull();
                                expect(collaborators.length).toBe(collabCountBeforeDelete);
                                done();
                            });
                       }
                    );
                });
            });
        });
    });
    describe('Standard user attempting to perform CRUD actions for Collaborator', () => {
        beforeEach((done) => {
            request.get({
                url: 'http://localhost:3000/auth/fake',
                form: {
                    userId: arya.id,
                    email: arya.email,
                    role: arya.role
                }
            }, (err, res, body) => {
                done();
            });
        });
        describe('GET /wikis/:id/collaborators', () => {
            it('should not render a view to add collaborators', (done) => {
                request.get(`${base}${this.wiki.id}/collaborators`, (err, res, body) => {
                    expect(body).not.toContain('Add Collaborators');
                    done();
                })
            })
        })
        describe('POST /wikis/:id/collaborators/add', () => {
            it('should not create new collaborator(s)', (done) => {
                const options = {
                    url: `${base}${this.wiki.id}/collaborators/add`,
                    form: {
                        userId: 1,
                        name: 'John Snow',
                        wikiId: this.wiki.id
                    }
                };
                request.post(options, (err, res, body) => {
                    Collaborator.findOne({where: {userId: 1}})
                    .then((collaborator) => {
                        expect(collaborator).toBeNull();
                        done();
                    })
                    .catch((err) => {
                        console.log(err);
                        done();
                    });
                });
            });
        });
        describe('POST /wikis/:wikiId/collaborators/:id/destroy', () => {
            it('should not delete the collaborator with the associated ID', (done) => {
                Collaborator.all()
                .then((collaborators) => {
                    const collabCountBeforeDelete = collaborators.length;

                    expect(collabCountBeforeDelete).toBe(1);

                    request.post(
                        `${base}${this.wiki.id}/collaborators/${this.collaborator.id}/destroy`, (err, res, body) => {
                            Collaborator.all()
                            .then((collaborators) => {
                                expect(err).toBeNull();
                                expect(collaborators.length).toBe(collabCountBeforeDelete);
                                done();
                            });
                       }
                    );
                });
            });
        });
    });
    describe('Premium attempting to perform CRUD actions for Collaborator', () => {
        beforeEach((done) => {
            request.get({
                url: 'http://localhost:3000/auth/fake',
                form: {
                    userId: john.id,
                    email: john.email,
                    role: john.role
                }
            }, (err, res, body) => {
                done();
            });
        });
        describe('GET /wikis/:id/collaborators', () => {
            it('should render a view to add collaborators', (done) => {
                request.get(`${base}${this.wiki.id}/collaborators`, (err, res, body) => {
                    expect(body).toContain('Add Collaborators');
                    done();
                })
            })
        })
        describe('POST /wikis/:id/collaborators/add', () => {
            it('should create new collaborator(s)', (done) => {
                const options = {
                    url: `${base}${this.wiki.id}/collaborators/add`,
                    form: {
                        userId: arya.id,
                        name: 'Arya Stark',
                        wikiId: this.wiki.id
                    }
                };
                request.post(options, (err, res, body) => {
                    Collaborator.findOne({where: {userId: arya.id}})
                    .then((collaborator) => {
                        expect(collaborator.userId).toBe(arya.id);
                        done();
                    })
                    .catch((err) => {
                        console.log(err);
                        done();
                    });
                });
            });
        });
        describe('POST /wikis/:wikiId/collaborators/:id/destroy', () => {
            it('should delete the collaborator with the associated ID', (done) => {
                Collaborator.all()
                .then((collaborators) => {
                    const collabCountBeforeDelete = collaborators.length;

                    expect(collabCountBeforeDelete).toBe(1);

                    request.post(
                        `${base}${this.wiki.id}/collaborators/${this.collaborator.id}/destroy`, (err, res, body) => {
                            Collaborator.all()
                            .then((collaborators) => {
                                expect(err).toBeNull();
                                expect(collaborators.length).toBe(collabCountBeforeDelete - 1);
                                done();
                            });
                       }
                    );
                });
            });
        });
    });
    describe('Admin attempting to perform CRUD actions for Collaborator', () => {
        beforeEach((done) => {
            request.get({
                url: 'http://localhost:3000/auth/fake',
                form: {
                    userId: john.id,
                    email: john.email,
                    role: 'admin'
                }
            }, (err, res, body) => {
                done();
            });
        });
        describe('GET /wikis/:id/collaborators', () => {
            it('should render a view to add collaborators', (done) => {
                request.get(`${base}${this.wiki.id}/collaborators`, (err, res, body) => {
                    expect(body).toContain('Add Collaborators');
                    done();
                })
            })
        })
        describe('POST /wikis/:id/collaborators/add', () => {
            it('should create new collaborator(s)', (done) => {
                const options = {
                    url: `${base}${this.wiki.id}/collaborators/add`,
                    form: {
                        userId: arya.id,
                        name: 'Arya Stark',
                        wikiId: this.wiki.id
                    }
                };
                request.post(options, (err, res, body) => {
                    Collaborator.findOne({where: {userId: arya.id}})
                    .then((collaborator) => {
                        expect(collaborator.userId).toBe(arya.id);
                        done();
                    })
                    .catch((err) => {
                        console.log(err);
                        done();
                    });
                });
            });
        });
        describe('POST /wikis/:wikiId/collaborators/:id/destroy', () => {
            it('should delete the collaborator with the associated ID', (done) => {
                Collaborator.all()
                .then((collaborators) => {
                    const collabCountBeforeDelete = collaborators.length;

                    expect(collabCountBeforeDelete).toBe(1);

                    request.post(
                        `${base}${this.wiki.id}/collaborators/${this.collaborator.id}/destroy`, (err, res, body) => {
                            Collaborator.all()
                            .then((collaborators) => {
                                expect(err).toBeNull();
                                expect(collaborators.length).toBe(collabCountBeforeDelete - 1);
                                done();
                            });
                       }
                    );
                });
            });
        });
    });
});