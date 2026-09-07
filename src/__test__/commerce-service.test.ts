import { describe,it,expect } from 'vitest'; import { commerceService } from '../services/commerce-service';
describe('commerce service',()=>{it('returns the reference CommercePro dataset',async()=>{const data=await commerceService.getData(); expect(data.products.length).toBeGreaterThan(0); expect(data.orders.length).toBeGreaterThan(0);});});
