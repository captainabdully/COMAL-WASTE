import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

const TermsAndConditions = () => {
  const router = useRouter();
  
  return (
    
    <View style={styles.wrapper}>
        <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Terms and Conditions</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
      

      <Text style={styles.subtitle}>Country Material Limited</Text>

      <Text style={styles.heading}>1. Agreement to Terms</Text>
      <Text style={styles.body}>
        By accessing and using this mobile application, you accept and agree to be bound by the terms and provision of this agreement. Country Material Limited reserves the right to modify these terms at any time. Your continued use of the application signifies your acceptance of any modified terms.
      </Text>

      <Text style={styles.heading}>2. Use License</Text>
      <Text style={styles.body}>
        Permission is granted to temporarily download one copy of the materials (information or software) on Country Material Limited's mobile application for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
      </Text>
      <Text style={styles.body}>
        • Modify or copying the materials{'\n'}
        • Using the materials for any commercial purpose or for any public display{'\n'}
        • Attempting to decompile or reverse engineer any software contained on the application{'\n'}
        • Removing any copyright or other proprietary notations from the materials{'\n'}
        • Transferring the materials to another person or "mirroring" the materials on any other server
      </Text>

      <Text style={styles.heading}>3. Disclaimer</Text>
      <Text style={styles.body}>
        The materials on Country Material Limited's application are provided on an 'as is' basis. Country Material Limited makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
      </Text>

      <Text style={styles.heading}>4. Limitations</Text>
      <Text style={styles.body}>
        In no event shall Country Material Limited or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Country Material Limited's application.
      </Text>

      <Text style={styles.heading}>5. Accuracy of Materials</Text>
      <Text style={styles.body}>
        The materials appearing on Country Material Limited's application could include technical, typographical, or photographic errors. Country Material Limited does not warrant that any of the materials on its application are accurate, complete, or current. Country Material Limited may make changes to the materials contained on its application at any time without notice.
      </Text>

      <Text style={styles.heading}>6. Links</Text>
      <Text style={styles.body}>
        Country Material Limited has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Country Material Limited of the site. Use of any such linked website is at the user's own risk.
      </Text>

      <Text style={styles.heading}>7. Modifications</Text>
      <Text style={styles.body}>
        Country Material Limited may revise these terms of service for its application at any time without notice. By using this application, you are agreeing to be bound by the then current version of these terms of service.
      </Text>

      <Text style={styles.heading}>8. Governing Law</Text>
      <Text style={styles.body}>
        These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction where Country Material Limited operates, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
      </Text>

      <Text style={styles.title}>Privacy Policy</Text>
      <Text style={styles.subtitle}>Country Material Limited</Text>

      <Text style={styles.heading}>1. Introduction</Text>
      <Text style={styles.body}>
        Country Material Limited ("we", "us", "our", or "Company") operates the mobile application. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our application and the choices you have associated with that data.
      </Text>

      <Text style={styles.heading}>2. Information Collection and Use</Text>
      <Text style={styles.body}>
        We collect several different types of information for various purposes to provide and improve our service to you.
      </Text>
      <Text style={styles.heading}>Types of Data Collected:</Text>
      <Text style={styles.body}>
        • Personal Data: Name, email address, phone number, address, account credentials{'\n'}
        • Device Information: Device type, operating system, unique device identifiers{'\n'}
        • Usage Data: Pages visited, time spent, features used, interactions with content{'\n'}
        • Location Data: GPS coordinates (with your permission)
      </Text>

      <Text style={styles.heading}>3. Use of Data</Text>
      <Text style={styles.body}>
        Country Material Limited uses the collected data for various purposes:{'\n'}
        • To provide and maintain our application{'\n'}
        • To notify you about changes to our application{'\n'}
        • To provide customer support{'\n'}
        • To gather analysis or valuable information{'\n'}
        • To monitor the usage of our application{'\n'}
        • To detect, prevent and address technical issues
      </Text>

      <Text style={styles.heading}>4. Security of Data</Text>
      <Text style={styles.body}>
        The security of your data is important to us but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
      </Text>

      <Text style={styles.heading}>5. Changes to This Privacy Policy</Text>
      <Text style={styles.body}>
        We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "effective date" at the top of this Privacy Policy.
      </Text>

      <Text style={styles.heading}>6. Contact Us</Text>
      <Text style={styles.body}>
        If you have any questions about this Privacy Policy, please contact us:{'\n'}
        Country Material Limited{'\n'}
        Email: info@countrymaterial.com{'\n'}
        Phone: +255 655
      </Text>

      <View style={styles.spacing} />
    </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    color: '#666',
  },
  heading: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
    color: '#333',
    marginBottom: 12,
  },
  spacing: {
    height: 32,
  },
});

export default TermsAndConditions;
