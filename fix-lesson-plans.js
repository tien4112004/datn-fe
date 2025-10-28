const fs = require('fs');
const path = './container/src/features/classes/api/data/lesson-plans.data.ts';

let content = fs.readFileSync(path, 'utf8');

// Remove subject and teacher objects, keep only IDs
content = content.replace(/subject: \{[\s\S]*?\},\s+/g, '');
content = content.replace(/teacher: \{[\s\S]*?\},\s+/g, '');

// Add IDs to objectives that don't have them
content = content.replace(/objectives: \[([\s\S]*?)\]/g, (match, objectivesContent) => {
  let objCount = 1;
  return match.replace(/\{\s*lessonPlanId: 'lesson-(\d+)'/g, (objMatch, lessonNum) => {
    if (!objMatch.includes('id:')) {
      return objMatch.replace('{', "{\n        id: 'obj-" + lessonNum + '-' + objCount++ + "',");
    }
    return objMatch;
  });
});

// Add IDs to resources that don't have them
content = content.replace(/resources: \[([\s\S]*?)\]/g, (match, resourcesContent) => {
  let resCount = 1;
  return match.replace(/\{\s*lessonPlanId: 'lesson-(\d+)'/g, (resMatch, lessonNum) => {
    if (!resMatch.includes('id:')) {
      return resMatch.replace('{', "{\n        id: 'res-" + lessonNum + '-' + resCount++ + "',");
    }
    return resMatch;
  });
});

fs.writeFileSync(path, content);
console.log('Cleaned up lesson-plans.data.ts');
