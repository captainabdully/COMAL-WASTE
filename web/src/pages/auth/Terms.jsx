import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const C = 'Country Material Limited';
const terms = [
  ['1. Agreement to Terms', `By accessing and using this mobile application, you accept and agree to be bound by the terms and provision of this agreement. ${C} reserves the right to modify these terms at any time. Your continued use of the application signifies your acceptance of any modified terms.`],
  ['2. Use License', `Permission is granted to temporarily download one copy of the materials (information or software) on ${C}'s mobile application for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:`, [
    'Modify or copying the materials',
    'Using the materials for any commercial purpose or for any public display',
    'Attempting to decompile or reverse engineer any software contained on the application',
    'Removing any copyright or other proprietary notations from the materials',
    'All right are observed by the law and regulations of Tanzania',
    'Transferring the materials to another person or "mirroring" the materials on any other server',
  ]],
  ['3. Disclaimer for the vendor!', `The materials on ${C}'s application are provided on an 'as is' basis. ${C} makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.`],
  ['4. Limitations', `In no event shall ${C} or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on ${C}'s application.`],
  ['5. Accuracy of Materials', `The materials appearing on ${C}'s application could include technical, typographical, or photographic errors. ${C} does not warrant that any of the materials on its application are accurate, complete, or current. ${C} may make changes to the materials contained on its application at any time without notice.`],
  ['6. Links', `${C} has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by ${C} of the site. Use of any such linked website is at the user's own risk.`],
  ['7. Modifications', `${C} may revise these terms of service for its application at any time without notice. By using this application, you are agreeing to be bound by the then current version of these terms of service.`],
  ['8. Governing Law', `These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction where ${C} operates, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.`],
];

const privacy = [
  ['1. Introduction', `${C} ("we", "us", "our", or "Company") operates the mobile application. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our application and the choices you have associated with that data.`],
  ['2. Information Collection and Use', 'We collect several different types of information for various purposes to provide and improve our service to you.'],
  ['Types of Data Collected:', '', [
    'Personal Data: Name, email address, phone number, address, account credentials',
    'Device Information: Device type, operating system, unique device identifiers',
    'Usage Data: Pages visited, time spent, features used, interactions with content',
    'Location Data: GPS coordinates (with your permission)',
  ]],
  ['3. Use of Data', `${C} uses the collected data for various purposes:`, [
    'To provide and maintain our application',
    'To notify you about changes to our application',
    'To provide customer support',
    'To gather analysis or valuable information',
    'To monitor the usage of our application',
    'To detect, prevent and address technical issues',
  ]],
  ['4. Security of Data', 'The security of your data is important to us but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.'],
  ['5. Changes to This Privacy Policy', 'We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "effective date" at the top of this Privacy Policy.'],
  ['6. Contact Us', 'If you have any questions about this Privacy Policy, please contact us:', ['Email: info@countrymaterial.com', 'Phone: +255 655']],
];

function Block({ title, sections }) {
  return (
    <>
      <h2 className="text-4xl font-bold tracking-tight mt-12">{title}</h2>
      <p className="text-gray-500 mb-2">{C}</p>
      {sections.map(([h, body, items]) => (
        <section key={h}>
          <h3 className="text-base font-bold mt-6 mb-1">{h}</h3>
          {body && <p className="text-slate-600 leading-7">{body}</p>}
          {items && <ul className="list-disc pl-5 text-slate-600 leading-7 mt-1">{items.map((i) => <li key={i}>{i}</li>)}</ul>}
        </section>
      ))}
    </>
  );
}

export default function Terms() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <div className="max-w-3xl mx-auto px-5 py-12">
        <button onClick={() => navigate(-1)} className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"><ArrowLeft className="w-4 h-4" />Back</button>
        <article className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 sm:p-12">
          <h1 className="text-4xl font-bold tracking-tight">Terms and Conditions</h1>
          <p className="text-slate-500 mb-2">{C}</p>
          {terms.map(([h, body, items]) => (
            <section key={h}>
              <h3 className="text-base font-bold mt-6 mb-1">{h}</h3>
              <p className="text-slate-600 leading-7">{body}</p>
              {items && <ul className="list-disc pl-5 text-slate-600 leading-7 mt-1">{items.map((i) => <li key={i}>{i}</li>)}</ul>}
            </section>
          ))}
          <Block title="Privacy Policy" sections={privacy} />
        </article>
      </div>
    </div>
  );
}
