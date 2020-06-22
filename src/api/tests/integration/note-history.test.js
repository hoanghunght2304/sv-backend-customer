// /* eslint-disable no-undef */
// /* eslint-disable arrow-body-style */
// /* eslint-disable no-unused-expressions */
// import { Op } from 'sequelize';
// import request from 'supertest';
// import httpStatus from 'http-status';
// import { expect } from 'chai';
// import { omit } from 'lodash';
// import app from '../../../index';
// import BodyNoteHistory from '../../../common/models/note-history.model';

// const token = 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InNoYWR5bG92ZSIsInBob25lIjoiMDk4ODg4ODg4OCIsImVtYWlsIjoiZW1haWxAZ21haWwuY29tIiwibmFtZSI6Ik5ndXnhu4VuIFbEg24gVGjDoG5oIiwiYXZhdGFyIjoiL3N0b3JhZ2VzL2F2YXRhci9kZWZhdWx0LmpwZyIsImV4cCI6MTU4MzI5MTA2MCwiaWF0IjoxNTgzMjA0NjYwLCJhdWQiOiJ3ZWIiLCJpc3MiOiJhdXRoLmR1eW5ndXllbnRhaWxvci5jb20vdXNlci93ZWIifQ.NtRanvzyC-BmlRgDiX1YD5RhJ_8yCpVGCmrEy8LyAxmuSaY1y0gPqC0h9oPdAy99JTn6ofWQ8Js3HBJ2QKU0sTa7QtPjSmlYgQpVPT4vqDrCDO2aBwHbSqW-y62jbzNTpxkukP1rPPhWRY0Z9ct9JBgtY8yIvUoe_hn1x5K0HGhhoxgISH5DNULQhWAYT5tRxFWrHu1ug72yj31c-Q1f37WPmB1hg56FbHTXYZmBFeg7Xavr3Sx9jjY0PQovSyvIWvRN8ssQBHL-fWEEwwCz_UAT-LHkyiWTaWxF2TxF9zn8H9qs7Bd5vQ5I0x2WLulSqSCB_54d5jxdAyNnyx1Qcw';
// describe('Customer API', async () => {
//     let records;
//     let newRecord;

//     beforeEach(async () => {
//         records = [
//             {
//                 key: 'rong_vai',
//                 value: '10',
//                 customer_id: 'KH001',
//                 created_by: {
//                     id: 'hoanghung',
//                     name: 'Hoang Hung'
//                 }
//             },
//             {
//                 key: 'dai_ao',
//                 value: '20',
//                 customer_id: 'KH002',
//                 created_by: {
//                     id: 'hoanghung',
//                     name: 'Hoang Hung'
//                 }
//             },
//             {
//                 key: 'dai_ao',
//                 value: '30',
//                 customer_id: 'KH002',
//                 created_by: {
//                     id: 'hoanghung',
//                     name: 'Hoang Hung'
//                 }
//             }
//         ];
//         newRecord = {
//             key: 'rong_vai',
//             value: '40',
//             customer_id: 'KH001',
//             created_by: {
//                 id: 'hoanghung',
//                 name: 'Hoang Hung'
//             }
//         };
//         await BodyNoteHistory.destroy({
//             where: { id: { [Op.ne]: null } }
//         });
//         await BodyNoteHistory.bulkCreate(records);
//     });

//     describe('GET /v1/note-history', () => {
//         it('should report error when required query customer is not provided', () => {
//             return request(app)
//                 .get('/v1/note-history')
//                 .set('Authorization', token)
//                 .query(omit(records, 'customer'))
//                 .expect('Content-Type', /json/)
//                 .expect(httpStatus.OK)
//                 .then((res) => {
//                     const { field, location, messages } = res.body.errors[0];
//                     expect(res.body.code).to.equal(400);
//                     expect(field).to.be.equal('customer_id');
//                     expect(location).to.be.equal('query');
//                     expect(messages).to.include('"customer_id" is required');
//                     console.log('ok');
//                 });
//         });
//         it('should report error when incorrect query customer', () => {
//             return request(app)
//                 .get('/v1/note-history')
//                 .set('Authorization', token)
//                 .query({ customer: {} })
//                 .expect('Content-Type', /json/)
//                 .expect(httpStatus.OK)
//                 .then((res) => {
//                     const { field, location, messages } = res.body.errors[0];
//                     expect(res.body.code).to.equal(400);
//                     expect(field).to.be.equal('customer_id');
//                     expect(location).to.be.equal('query');
//                     expect(messages).to.include('"customer_id" is required');
//                     console.log('ok');
//                 });
//         });
//         it('should get all body note history with query customer', () => {
//             return request(app)
//                 .get('/v1/note-history')
//                 .set('Authorization', token)
//                 .query({ customer_id: 'KH002' })
//                 .expect('Content-Type', /json/)
//                 .expect(httpStatus.OK)
//                 .then((res) => {
//                     expect(res.body.code).to.be.equal(0);
//                     expect(res.body.data).to.be.an('object');

//                     expect(res.body.data.dai_ao).to.be.an('array');
//                     expect(res.body.data.dai_ao).to.have.lengthOf(2);
//                     console.log('ok');
//                 });
//         });
//     });

//     describe('POST /v1/note-history', () => {
//         it('should create a new body note history when request is ok', () => {
//             return request(app)
//                 .post('/v1/note-history')
//                 .set('Authorization', token)
//                 .send(newRecord)
//                 .expect('Content-Type', /json/)
//                 .expect(httpStatus.OK)
//                 .then((res) => {
//                     expect(res.body.code).to.not.equal(400);
//                     console.log('ok');
//                 });
//         });
//         it('should report error when required fields is not provided', () => {
//             const requiredFields = ['key', 'value', 'customer_id'];
//             newRecord = omit(newRecord, requiredFields);
//             return request(app)
//                 .post('/v1/note-history')
//                 .set('Authorization', token)
//                 .send(newRecord)
//                 .expect('Content-Type', /json/)
//                 .expect(httpStatus.OK)
//                 .then((res) => {
//                     for (
//                         let index = 0;
//                         index < requiredFields.length;
//                         index += 1
//                     ) {
//                         const field = requiredFields[index];
//                         expect(res.body.errors[index].field).to.be.equal(
//                             `${field}`
//                         );
//                         expect(res.body.errors[index].location).to.be.equal(
//                             'body'
//                         );
//                         expect(res.body.errors[index].messages).to.include(
//                             `"${field}" is required`
//                         );
//                     }
//                 });
//         });
//     });
// });
