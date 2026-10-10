import {test} from 'node:test';
import assert from 'node:assert/strict';
import {composeMessage,emailLink,whatsappLink} from '../src/enquiry.js';
test('Project handoffs preserve punctuation and multiline briefs',()=>{
 const values={name:' A & B ',email:'hello@example.com',service:'CGI & Motion',message:'A product launch.\nBudget: ₹50,000 + tax'};
 const email=emailLink(values);
 assert.equal(decodeURIComponent(email.split('&body=')[1]),composeMessage(values));
 assert.equal(new URL(whatsappLink(values)).searchParams.get('text'),composeMessage(values));
 assert.match(composeMessage(values),/^Name: A & B/);
 assert.doesNotMatch(composeMessage(values),/undefined/);
});
test('Career messages include portfolio and role, without unrelated project fields',()=>{
 const values={name:'Alex',email:'alex@example.com',role:'Design & UI/UX',portfolio:'https://example.com/cv?x=1&y=2',message:'Interested in design.',budget:'Ignore me'};
 const email=new URL(emailLink(values,true));
 assert.equal(email.searchParams.get('subject'),'Career enquiry — Kraftor');
 assert.match(email.searchParams.get('body'),/https:\/\/example.com\/cv\?x=1&y=2/);
 assert.doesNotMatch(email.searchParams.get('body'),/Ignore me/);
});
