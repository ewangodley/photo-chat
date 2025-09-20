#!/bin/bash

echo "🚀 Running Production-Ready Test Suite"
echo "======================================"

cd tests
node -e "
const ProductionReadyTests = require('./server/production-ready-tests');
const tests = new ProductionReadyTests();

tests.runAllTests().then(results => {
  const passed = results.filter(r => r.status === 'PASSED').length;
  const failed = results.filter(r => r.status === 'FAILED').length;
  
  console.log('\n📊 Production Test Results');
  console.log('==========================');
  console.log('Total Tests:', results.length);
  console.log('Passed:', passed);
  console.log('Failed:', failed);
  
  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.filter(r => r.status === 'FAILED').forEach(test => {
      console.log('  •', test.name + ':', test.error);
    });
    console.log('\n⚠️  Some tests failed - review and fix issues');
    process.exit(1);
  } else {
    console.log('\n✅ All production tests passed!');
    console.log('🎉 System is ready for deployment');
    process.exit(0);
  }
}).catch(error => {
  console.error('❌ Test suite error:', error.message);
  process.exit(1);
});
"