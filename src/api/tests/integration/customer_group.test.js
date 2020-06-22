// /* eslint-disable no-undef */
// /* eslint-disable arrow-body-style */
// /* eslint-disable no-unused-expressions */
// import { Op } from 'sequelize';
// import request from 'supertest';
// import httpStatus from 'http-status';
// import { expect } from 'chai';
// import { omit } from 'lodash';
// import app from '../../../index';
// import CustomerGroup from '../../../common/models/customer-group.model';

// const token = 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjA4ODg4ODg4IiwicGhvbmUiOiIwODg4ODg4ODg4IiwiZW1haWwiOiJ2dXF1YW5nbmFtQGdtYWlsLmNvbSIsIm5hbWUiOiJOYW1WUSIsImF2YXRhciI6Ii9zdG9yYWdlcy9hdmF0YXIvZGVmYXVsdC5qcGciLCJleHAiOjE1ODM1NzA1NTgsImlhdCI6MTU4MzQ4NDE1OCwiYXVkIjoid2ViIiwiaXNzIjoiYXV0aC5kdXluZ3V5ZW50YWlsb3IuY29tL3VzZXIvd2ViIn0.G9PgJRkorR4kUsdNKoj5Vj_WeQrxtN2rCCT6uRPLLdvhDkuoiOxu_ZoSiR3I632oTN8woi11v8xpQSLJdjnhbWPNKU4eWZ3tpnATkdqfGpjyGyY36hmevd9_mqJDpgu8NSbzXS6qOFFTzIPg4s339OjKIP4jyqWQBPAFiNatEsBXdrK_hK7p4b22a9-uQkWUx84ea7u4gyk30_u_Hfnne67-yXR4Ouc-vmDG8b9cTmEXAiyLNoXecH4WLfTdlv8PuQdbW7_dKo1vjNB0HSweEUxMC-2oTd0gY0PxmTeZlClYrYyXySt6EBtWegljPlSafo4j9n4zY6oyfkB0GmBErw';

// describe('Customer-groups API', async () => {
//     let dbCustomerGroup;

//     const dbInsert = {
//         name: 'Nhóm 112',
//         note: 'nhóm 112',
//         customers: [
//             {
//                 id: '5e589ce9aff7c313805e17de',
//                 name: 'Khách Hàng 5'
//             },
//             {
//                 id: '5e589d0faff7c313805e17e3',
//                 name: 'Khách Hàng 6'
//             }
//         ],
//         store: {
//             id: 'DT1',
//             name: 'DT1',
//             phone: '0987654543'
//         }
//     };

//     beforeEach(async () => {
//         dbCustomerGroup = [
//             {
//                 id: 1,
//                 name: 'Nhóm 1',
//                 note: 'Nhóm 1',
//                 created_by: {
//                     id: '08888888',
//                     name: 'NamVQ'
//                 },
//                 customers: [
//                     {
//                         id: '5e589ce9aff7c313805e17de',
//                         name: 'Khách Hàng 5'
//                     }
//                 ],
//                 store: {
//                     id: 'DT1',
//                     name: 'DT1',
//                     phone: '0987654543'
//                 }
//             },
//             {
//                 id: 2,
//                 name: 'Đội 2',
//                 note: 'Đội 2',
//                 created_by: {
//                     id: '08888888',
//                     name: 'NamVQ'
//                 },
//                 customers: [
//                     {
//                         id: '5e589ce9aff7c313805e17de',
//                         name: 'Khách Hàng 5'
//                     }
//                 ],
//                 store: {
//                     id: 'DT1',
//                     name: 'DT1',
//                     phone: '0987654543'
//                 }
//             },
//             {
//                 id: 3,
//                 name: 'Phòng 3',
//                 note: 'Phòng 3',
//                 created_by: {
//                     id: '08888888',
//                     name: 'NamVQ'
//                 },
//                 customers: [
//                     {
//                         id: '5e589ce9aff7c313805e17de',
//                         name: 'Khách Hàng 5'
//                     }
//                 ],
//                 store: {
//                     id: 'DT1',
//                     name: 'DT1',
//                     phone: '0987654543'
//                 }
//             }
//         ];

//         await CustomerGroup.destroy({
//             where: {
//                 id: { [Op.ne]: null }
//             }
//         });

//         await CustomerGroup.bulkCreate(dbCustomerGroup);
//     });

//     describe('GET /v1/customer-group', () => {
//         it('should get all customer group', () => {
//             return request(app)
//                 .get('/v1/customer-group')
//                 .set('Authorization', token)
//                 .expect('Content-Type', /json/)
//                 .expect(httpStatus.OK)
//                 .then((res) => {
//                     expect(res.body.count).to.be.an('number');
//                     expect(res.body.count).to.be.eq(3);
//                     expect(res.body.data).to.be.an('array');
//                     expect(res.body.data).to.have.lengthOf(3);
//                 });
//         });

//         it('should get customer-group with param skip 2, limit 10', () => {
//             return request(app)
//                 .get('/v1/customer-group')
//                 .set('Authorization', token)
//                 .query({ skip: 2, limit: 10 })
//                 .expect('Content-Type', /json/)
//                 .expect(httpStatus.OK)
//                 .then((res) => {
//                     expect(res.body.data).to.be.an('array');
//                     expect(res.body.data).to.have.lengthOf(1);
//                 });
//         });

//         it('should return error param skip not a number', () => {
//             return request(app)
//                 .get('/v1/customer-group')
//                 .set('Authorization', token)
//                 .query({ skip: 'haha', limit: 20 })
//                 .expect('Content-Type', /json/)
//                 .expect(httpStatus.OK)
//                 .then((res) => {
//                     const { field, location, messages } = res.body.errors[0];
//                     expect(res.body.code).to.equal(400);
//                     expect(field).to.be.equal('skip');
//                     expect(location).to.be.equal('query');
//                     expect(messages).to.include('"skip" must be a number');
//                 });
//         });

//         it('should return error param limit not a number', () => {
//             return request(app)
//                 .get('/v1/customer-group')
//                 .set('Authorization', token)
//                 .query({ skip: 0, limit: 'haha' })
//                 .expect('Content-Type', /json/)
//                 .expect(httpStatus.OK)
//                 .then((res) => {
//                     const { field, location, messages } = res.body.errors[0];
//                     expect(res.body.code).to.be.equal(400);
//                     expect(field).to.be.equal('limit');
//                     expect(location).to.be.equal('query');
//                     expect(messages).to.include('"limit" must be a number');
//                 });
//         });

//         it('should get all customer-group with param keyword Nhóm', () => {
//             return request(app)
//                 .get('/v1/customer-group')
//                 .set('Authorization', token)
//                 .query({ keyword: 'Nhóm' })
//                 .expect('Content-Type', /json/)
//                 .expect(httpStatus.OK)
//                 .then((res) => {
//                     expect(res.body.count).to.be.an('number');
//                     expect(res.body.count).to.be.eq(1);
//                     expect(res.body.data).to.be.an('array');
//                     expect(res.body.data).to.have.lengthOf(1);
//                 });
//         });

//         it('should get all customer-group with param by_date: create, start_time, end_time', () => {
//             return request(app)
//                 .get('/v1/customer-group')
//                 .set('Authorization', token)
//                 .query({ by_date: 'create', start_time: '02/24/2020', end_time: '02/25/2020' })
//                 .expect('Content-Type', /json/)
//                 .expect(httpStatus.OK)
//                 .then((res) => {
//                     expect(res.body.count).to.be.equal(0);
//                     expect(res.body.code).to.be.equal(0);
//                     expect(res.body.data).to.have.lengthOf(0);
//                 });
//         });

//         it('should get return error with param start_time not a date', () => {
//             return request(app)
//                 .get('/v1/customer-group')
//                 .set('Authorization', token)
//                 .query({ start_time: 'haha' })
//                 .expect('Content-Type', /json/)
//                 .expect(httpStatus.OK)
//                 .then((res) => {
//                     const { field, location, messages } = res.body.errors[0];
//                     expect(field).to.be.equal('start_time');
//                     expect(location).to.be.equal('query');
//                     expect(res.body.code).to.equal(400);
//                     expect(messages).to.include(
//                         '"start_time" must be a number of milliseconds or valid date string'
//                     );
//                 });
//         });

//         it('should get return error with param end_time not a date', () => {
//             return request(app)
//                 .get('/v1/customer-group')
//                 .set('Authorization', token)
//                 .query({ end_time: 'haha' })
//                 .expect('Content-Type', /json/)
//                 .expect(httpStatus.OK)
//                 .then((res) => {
//                     const { field, location, messages } = res.body.errors[0];
//                     expect(field).to.be.equal('end_time');
//                     expect(location).to.be.equal('query');
//                     expect(res.body.code).to.equal(400);
//                     expect(messages).to.include(
//                         '"end_time" must be a number of milliseconds or valid date string'
//                     );
//                 });
//         });
//     });

//     describe('GET /v1/customer-group/:id', () => {
//         it('should return error with id incorrect', () => {
//             return request(app)
//                 .get('/v1/customer-group/9')
//                 .set('Authorization', token)
//                 .expect('Content-Type', /json/)
//                 .expect(httpStatus.OK)
//                 .then((res) => {
//                     expect(res.body.code).to.equal(404);
//                     expect(res.body.message).to.equal('Không tìm thấy dữ liệu.!');
//                 });
//         });

//         it('should report error when id not are number', () => {
//             return request(app)
//                 .delete('/v1/customer-group/haha')
//                 .set('Authorization', token)
//                 .expect('Content-Type', /json/)
//                 .expect(httpStatus.OK)
//                 .then((res) => {
//                     expect(res.body.code).to.equal(500);
//                     expect(res.body.message).to.equal('column "haha" does not exist');
//                 });
//         });

//         it('should get customer group by id', async () => {
//             let model = await CustomerGroup.findOne({
//                 id: dbCustomerGroup[0].id
//             });

//             model = CustomerGroup.transform(model);

//             return request(app)
//                 .get(`/v1/customer-group/${model.id}`)
//                 .set('Authorization', token)
//                 .expect('Content-Type', /json/)
//                 .expect(httpStatus.OK)
//                 .then((res) => {
//                     expect(res.body.data.id).to.equal(model.id);
//                     expect(res.body.code).to.equal(0);
//                 });
//         });
//     });

//     describe('POST /v1/customer-group', () => {
//         it('should customer group be created when request is ok', () => {
//             return request(app)
//                 .post('/v1/customer-group')
//                 .set('Authorization', token)
//                 .send(dbInsert)
//                 .expect('Content-Type', /json/)
//                 .expect(httpStatus.OK)
//                 .then((res) => {
//                     expect(res.body.code).to.equal(0);
//                     expect(res.body.message).to.equal('Thêm mới thành công.!');
//                 });
//         });


//         it('should report error when add customer group not name', () => {
//             return request(app)
//                 .post('/v1/customer-group')
//                 .set('Authorization', token)
//                 .send(omit(dbInsert, 'name'))
//                 .expect('Content-Type', /json/)
//                 .expect(httpStatus.OK)
//                 .then((res) => {
//                     const { field, location, messages } = res.body.errors[0];
//                     expect(field).to.be.equal('name');
//                     expect(location).to.be.equal('body');
//                     expect(res.body.code).to.equal(400);
//                     expect(messages).to.include('"name" is required');
//                 });
//         });

//         it('should report errors when customers do not exist', () => {
//             return request(app)
//                 .post('/v1/customer-group')
//                 .set('Authorization', token)
//                 .send(omit(dbInsert, 'customers'))
//                 .expect('Content-Type', /json/)
//                 .expect(httpStatus.OK)
//                 .then((res) => {
//                     const { field, location, messages } = res.body.errors[0];
//                     expect(res.body.code).to.be.equal(400);
//                     expect(field).to.be.equal('customers');
//                     expect(location).to.be.equal('body');
//                     expect(messages).to.include('"customers" is required');
//                 });
//         });

//         it('should report errors when store do not exist', () => {
//             return request(app)
//                 .post('/v1/customer-group')
//                 .set('Authorization', token)
//                 .send(omit(dbInsert, 'store'))
//                 .expect('Content-Type', /json/)
//                 .expect(httpStatus.OK)
//                 .then((res) => {
//                     const { field, location, messages } = res.body.errors[0];
//                     expect(res.body.code).to.be.equal(400);
//                     expect(field).to.be.equal('store');
//                     expect(location).to.be.equal('body');
//                     expect(messages).to.include('"store" is required');
//                 });
//         });

//         it('should report an error when the store is not the object', () => {
//             return request(app)
//                 .post('/v1/customer-group')
//                 .set('Authorization', token)
//                 .send({
//                     name: 'Nhóm 112',
//                     note: 'nhóm 112',
//                     customers: [
//                         {
//                             id: '5e589ce9aff7c313805e17de',
//                             name: 'Khách Hàng 5'
//                         },
//                         {
//                             id: '5e589d0faff7c313805e17e3',
//                             name: 'Khách Hàng 6'
//                         }
//                     ],
//                     store: []
//                 })
//                 .expect('Content-Type', /json/)
//                 .expect(httpStatus.OK)
//                 .then((res) => {
//                     const { field, location, messages } = res.body.errors[0];
//                     expect(res.body.code).to.be.equal(400);
//                     expect(field).to.be.equal('store');
//                     expect(location).to.be.equal('body');
//                     expect(messages).to.include('"store" must be an object');
//                 });
//         });

//         it('should report error when the store has no id', () => {
//             return request(app)
//                 .post('/v1/customer-group')
//                 .set('Authorization', token)
//                 .send({
//                     name: 'Nhóm 112',
//                     note: 'nhóm 112',
//                     customers: [
//                         {
//                             id: '5e589ce9aff7c313805e17de',
//                             name: 'Khách Hàng 5'
//                         },
//                         {
//                             id: '5e589d0faff7c313805e17e3',
//                             name: 'Khách Hàng 6'
//                         }
//                     ],
//                     store: {
//                         name: 'DT1',
//                         phone: '0987654543'
//                     }
//                 })
//                 .expect('Content-Type', /json/)
//                 .expect(httpStatus.OK)
//                 .then((res) => {
//                     const { field, location, messages } = res.body.errors[0];
//                     expect(res.body.code).to.be.equal(400);
//                     expect(field).to.be.equal('store.id');
//                     expect(location).to.be.equal('body');
//                     expect(messages).to.include('"id" is required');
//                 });
//         });

//         it('should report error when the store has no name', () => {
//             return request(app)
//                 .post('/v1/customer-group')
//                 .set('Authorization', token)
//                 .send({
//                     name: 'Nhóm 112',
//                     note: 'nhóm 112',
//                     customers: [
//                         {
//                             id: '5e589ce9aff7c313805e17de',
//                             name: 'Khách Hàng 5'
//                         },
//                         {
//                             id: '5e589d0faff7c313805e17e3',
//                             name: 'Khách Hàng 6'
//                         }
//                     ],
//                     store: {
//                         id: 'DT1',
//                         phone: '0987654543'
//                     }
//                 })
//                 .expect('Content-Type', /json/)
//                 .expect(httpStatus.OK)
//                 .then((res) => {
//                     const { field, location, messages } = res.body.errors[0];
//                     expect(res.body.code).to.be.equal(400);
//                     expect(field).to.be.equal('store.name');
//                     expect(location).to.be.equal('body');
//                     expect(messages).to.include('"name" is required');
//                 });
//         });

//         it('should report error when the store has no phone', () => {
//             return request(app)
//                 .post('/v1/customer-group')
//                 .set('Authorization', token)
//                 .send({
//                     name: 'Nhóm 112',
//                     note: 'nhóm 112',
//                     customers: [
//                         {
//                             id: '5e589ce9aff7c313805e17de',
//                             name: 'Khách Hàng 5'
//                         },
//                         {
//                             id: '5e589d0faff7c313805e17e3',
//                             name: 'Khách Hàng 6'
//                         }
//                     ],
//                     store: {
//                         id: 'DT1',
//                         name: 'DT1',
//                     }
//                 })
//                 .expect('Content-Type', /json/)
//                 .expect(httpStatus.OK)
//                 .then((res) => {
//                     const { field, location, messages } = res.body.errors[0];
//                     expect(res.body.code).to.be.equal(400);
//                     expect(field).to.be.equal('store.phone');
//                     expect(location).to.be.equal('body');
//                     expect(messages).to.include('"phone" is required');
//                 });
//         });

//         it('should  report error  when the customer is the object', () => {
//             return request(app)
//                 .post('/v1/customer-group')
//                 .set('Authorization', token)
//                 .send({
//                     name: 'Nhóm 112',
//                     note: 'nhóm 112',
//                     customers: {},
//                     store: {
//                         id: 'DT1',
//                         name: 'DT1',
//                         phone: '0987654543'
//                     }
//                 })
//                 .expect('Content-Type', /json/)
//                 .expect(httpStatus.OK)
//                 .then((res) => {
//                     expect(res.body.code).to.equal(400);
//                     expect(res.body.errors[0].messages[0]).to.equal('"customers" must be an array');
//                 });
//         });

//         it('should  report error  when the customer is the boolean', () => {
//             return request(app)
//                 .post('/v1/customer-group')
//                 .set('Authorization', token)
//                 .send({
//                     name: 'Nhóm 112',
//                     note: 'nhóm 112',
//                     customers: true,
//                     store: {
//                         id: 'DT1',
//                         name: 'DT1',
//                         phone: '0987654543'
//                     }
//                 })
//                 .expect('Content-Type', /json/)
//                 .expect(httpStatus.OK)
//                 .then((res) => {
//                     const { field, location, messages } = res.body.errors[0];
//                     expect(res.body.code).to.be.equal(400);
//                     expect(field).to.be.equal('customers');
//                     expect(location).to.be.equal('body');
//                     expect(messages).to.include('"customers" must be an array');
//                 });
//         });

//         it('should  report error  when the customer is the number', () => {
//             return request(app)
//                 .post('/v1/customer-group')
//                 .set('Authorization', token)
//                 .send({
//                     name: 'Nhóm 112',
//                     note: 'nhóm 112',
//                     customers: 123,
//                     store: {
//                         id: 'DT1',
//                         name: 'DT1',
//                         phone: '0987654543'
//                     }
//                 })
//                 .expect('Content-Type', /json/)
//                 .expect(httpStatus.OK)
//                 .then((res) => {
//                     const { field, location, messages } = res.body.errors[0];
//                     expect(res.body.code).to.be.equal(400);
//                     expect(field).to.be.equal('customers');
//                     expect(location).to.be.equal('body');
//                     expect(messages).to.include('"customers" must be an array');
//                 });
//         });

//         it('should  report error  when the customer is the string', () => {
//             return request(app)
//                 .post('/v1/customer-group')
//                 .set('Authorization', token)
//                 .send({
//                     name: 'Nhóm 112',
//                     note: 'nhóm 112',
//                     customers: 'haha',
//                     store: {
//                         id: 'DT1',
//                         name: 'DT1',
//                         phone: '0987654543'
//                     }
//                 })
//                 .expect('Content-Type', /json/)
//                 .expect(httpStatus.OK)
//                 .then((res) => {
//                     const { field, location, messages } = res.body.errors[0];
//                     expect(res.body.code).to.be.equal(400);
//                     expect(field).to.be.equal('customers');
//                     expect(location).to.be.equal('body');
//                     expect(messages).to.include('"customers" must be an array');
//                 });
//         });

//         it('should report error  when notes do not exist', () => {
//             return request(app)
//                 .post('/v1/customer-group')
//                 .set('Authorization', token)
//                 .send(omit(dbInsert, 'note'))
//                 .expect('Content-Type', /json/)
//                 .expect(httpStatus.OK)
//                 .then((res) => {
//                     const { field, location, messages } = res.body.errors[0];
//                     expect(res.body.code).to.be.equal(400);
//                     expect(field).to.be.equal('note');
//                     expect(location).to.be.equal('body');
//                     expect(messages).to.include('"note" is required');
//                 });
//         });
//     });

//     describe('PUT /v1/customer-group/:id', () => {
//         it('should report error when the id is incorrect', () => {
//             return request(app)
//                 .put('/v1/customer-group/9')
//                 .set('Authorization', token)
//                 .expect('Content-Type', /json/)
//                 .expect(httpStatus.OK)
//                 .then((res) => {
//                     expect(res.body.code).to.equal(404);
//                     expect(res.body.message).to.equal('Không tìm thấy dữ liệu.!');
//                 });
//         });

//         it('should report error when id not are number', () => {
//             return request(app)
//                 .put('/v1/customer-group/haha')
//                 .set('Authorization', token)
//                 .expect('Content-Type', /json/)
//                 .expect(httpStatus.OK)
//                 .then((res) => {
//                     expect(res.body.code).to.equal(500);
//                     expect(res.body.message).to.equal('column "haha" does not exist');
//                 });
//         });

//         it('should report error when the store is not the object', () => {
//             return request(app)
//                 .put('/v1/customer-group/2')
//                 .set('Authorization', token)
//                 .send({
//                     store: []
//                 })
//                 .expect('Content-Type', /json/)
//                 .expect(httpStatus.OK)
//                 .then((res) => {
//                     const { field, location, messages } = res.body.errors[0];
//                     expect(res.body.code).to.be.equal(400);
//                     expect(field).to.be.equal('store');
//                     expect(location).to.be.equal('body');
//                     expect(messages).to.include('"store" must be an object');
//                 });
//         });

//         it('should report error when the store has no id', () => {
//             return request(app)
//                 .put('/v1/customer-group/2')
//                 .set('Authorization', token)
//                 .send({
//                     store: {
//                         name: 'DT1',
//                         phone: '0987654543'
//                     }
//                 })
//                 .expect('Content-Type', /json/)
//                 .expect(httpStatus.OK)
//                 .then((res) => {
//                     const { field, location, messages } = res.body.errors[0];
//                     expect(res.body.code).to.be.equal(400);
//                     expect(field).to.be.equal('store.id');
//                     expect(location).to.be.equal('body');
//                     expect(messages).to.include('"id" is required');
//                 });
//         });

//         it('should report error when the store has no name', () => {
//             return request(app)
//                 .put('/v1/customer-group/2')
//                 .set('Authorization', token)
//                 .send({
//                     store: {
//                         id: 'DT1',
//                         phone: '0987654543'
//                     }
//                 })
//                 .expect('Content-Type', /json/)
//                 .expect(httpStatus.OK)
//                 .then((res) => {
//                     const { field, location, messages } = res.body.errors[0];
//                     expect(res.body.code).to.be.equal(400);
//                     expect(field).to.be.equal('store.name');
//                     expect(location).to.be.equal('body');
//                     expect(messages).to.include('"name" is required');
//                 });
//         });

//         it('should report an error when the store has no phone', () => {
//             return request(app)
//                 .put('/v1/customer-group/2')
//                 .set('Authorization', token)
//                 .send({
//                     store: {
//                         id: 'DT1',
//                         name: 'DT1',
//                     }
//                 })
//                 .expect('Content-Type', /json/)
//                 .expect(httpStatus.OK)
//                 .then((res) => {
//                     const { field, location, messages } = res.body.errors[0];
//                     expect(res.body.code).to.be.equal(400);
//                     expect(field).to.be.equal('store.phone');
//                     expect(location).to.be.equal('body');
//                     expect(messages).to.include('"phone" is required');
//                 });
//         });

//         it('should customer group be updated with the correct name', () => {
//             return request(app)
//                 .put('/v1/customer-group/1')
//                 .set('Authorization', token)
//                 .send(Object.assign({}, dbCustomerGroup, { name: 'Khach hang 1 update' }))
//                 .expect('Content-Type', /json/)
//                 .expect(httpStatus.OK)
//                 .then((res) => {
//                     expect(res.body.code).to.equal(0);
//                     expect(res.body.message).to.equal('Cập nhật dữ liệu thành công.!');
//                 });
//         });

//         it('should report error when name required field is not provided', () => {
//             return request(app)
//                 .put('/v1/customer-group/1')
//                 .set('Authorization', token)
//                 .send(Object.assign({}, dbCustomerGroup, { name: '' }))
//                 .expect('Content-Type', /json/)
//                 .expect(httpStatus.OK)
//                 .then((res) => {
//                     expect(res.body.code).to.equal(400);
//                     expect(res.body.errors[0].messages[0]).to.equal('"name" is not allowed to be empty');
//                 });
//         });

//         it('should customer group be updated with the correct note', () => {
//             return request(app)
//                 .put('/v1/customer-group/2')
//                 .set('Authorization', token)
//                 .send(Object.assign({}, dbCustomerGroup, { note: '12313123' }))
//                 .expect('Content-Type', /json/)
//                 .expect(httpStatus.OK)
//                 .then((res) => {
//                     expect(res.body.code).to.equal(0);
//                     expect(res.body.message).to.equal('Cập nhật dữ liệu thành công.!');
//                 });
//         });

//         it('should  report error  when the customer is the object', () => {
//             return request(app)
//                 .put('/v1/customer-group/2')
//                 .set('Authorization', token)
//                 .send(Object.assign({}, dbCustomerGroup, { customers: {} }))
//                 .expect('Content-Type', /json/)
//                 .expect(httpStatus.OK)
//                 .then((res) => {
//                     expect(res.body.code).to.equal(400);
//                     expect(res.body.errors[0].messages[0]).to.equal('"customers" must be an array');
//                 });
//         });

//         it('should  report error  when the customer is the boolean', () => {
//             return request(app)
//                 .put('/v1/customer-group/2')
//                 .set('Authorization', token)
//                 .send(Object.assign({}, dbCustomerGroup, { customers: true }))
//                 .expect('Content-Type', /json/)
//                 .expect(httpStatus.OK)
//                 .then((res) => {
//                     const { field, location, messages } = res.body.errors[0];
//                     expect(res.body.code).to.be.equal(400);
//                     expect(field).to.be.equal('customers');
//                     expect(location).to.be.equal('body');
//                     expect(messages).to.include('"customers" must be an array');
//                 });
//         });

//         it('should  report error  when the customer is the number', () => {
//             return request(app)
//                 .put('/v1/customer-group/2')
//                 .set('Authorization', token)
//                 .send(Object.assign({}, dbCustomerGroup, { customers: 2 }))
//                 .expect('Content-Type', /json/)
//                 .expect(httpStatus.OK)
//                 .then((res) => {
//                     const { field, location, messages } = res.body.errors[0];
//                     expect(res.body.code).to.be.equal(400);
//                     expect(field).to.be.equal('customers');
//                     expect(location).to.be.equal('body');
//                     expect(messages).to.include('"customers" must be an array');
//                 });
//         });

//         it('should  report error  when the customer is the string', () => {
//             return request(app)
//                 .put('/v1/customer-group/1')
//                 .set('Authorization', token)
//                 .send(Object.assign({}, dbCustomerGroup, { customers: 'haha' }))
//                 .expect('Content-Type', /json/)
//                 .expect(httpStatus.OK)
//                 .then((res) => {
//                     console.log(res.body);
//                     const { field, location, messages } = res.body.errors[0];
//                     expect(res.body.code).to.be.equal(400);
//                     expect(field).to.be.equal('customers');
//                     expect(location).to.be.equal('body');
//                     expect(messages).to.include('"customers" must be an array');
//                 });
//         });

//         it('should report error when note required field is not provided', () => {
//             return request(app)
//                 .put('/v1/customer-group/1')
//                 .set('Authorization', token)
//                 .send(Object.assign({}, dbCustomerGroup, { note: '' }))
//                 .expect('Content-Type', /json/)
//                 .expect(httpStatus.OK)
//                 .then((res) => {
//                     expect(res.body.code).to.equal(400);
//                     expect(res.body.errors[0].messages[0]).to.equal('"note" is not allowed to be empty');
//                 });
//         });
//     });

//     describe('DELETE /v1/customer-group/:id', () => {
//         it('should report error when id not are number', () => {
//             return request(app)
//                 .delete('/v1/customer-group/haha')
//                 .set('Authorization', token)
//                 .expect('Content-Type', /json/)
//                 .expect(httpStatus.OK)
//                 .then((res) => {
//                     expect(res.body.code).to.equal(500);
//                     expect(res.body.message).to.equal('column "haha" does not exist');
//                 });
//         });

//         it('should report error when id incorrect', () => {
//             return request(app)
//                 .delete('/v1/customer-group/4')
//                 .set('Authorization', token)
//                 .expect('Content-Type', /json/)
//                 .expect(httpStatus.OK)
//                 .then((res) => {
//                     expect(res.body.code).to.equal(404);
//                     expect(res.body.message).to.equal('Không tìm thấy dữ liệu.!');
//                 });
//         });

//         it('should customer group be deletion with the correct id', () => {
//             return request(app)
//                 .delete('/v1/customer-group/3')
//                 .set('Authorization', token)
//                 .expect('Content-Type', /json/)
//                 .expect(httpStatus.OK)
//                 .then((res) => {
//                     expect(res.body.code).to.equal(0);
//                     expect(res.body.message).to.equal('Xóa dữ liệu thành công.!');
//                 });
//         });
//     });
// });
