#!/bin/bash

echo "🧪 Running Minimal Test Suite"
echo "============================="

cd tests
node -e "
const MinimalTests = require('./server/minimal-tests');
const tests = new MinimalTests();

tests.runAllTests().then(results => {
  const passed = results.filter(r => r.status === 'PASSED').length;
  const failed = results.filter(r => r.status === 'FAILED').length;
  
  console.log('\n📊 Test Summary');
  console.log('================');
  console.log('Total Tests:', results.length);
  console.log('Passed:', passed);
  console.log('Failed:', failed);
  
  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.filter(r => r.status === 'FAILED').forEach(test => {
      console.log('  •', test.name + ':', test.error);
    });
    process.exit(1);
  } else {
    console.log('\n✅ All tests passed!');
    process.exit(0);
  }
}).catch(error => {
  console.error('Test error:', error);
  process.exit(1);
});
"