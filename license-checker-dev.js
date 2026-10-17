// Originally made by Google AI

const checker = require('license-checker');
const fs = require('fs');
const path = require('path');

// Target path where your Electron UI can access it
const outputPathFolder =  path.join(__dirname, 'src')
const outputPath = path.join(outputPathFolder, 'licenses.json'); 

checker.init({
    start: __dirname,
    production: true, // Only scans dependencies, ignores devDependencies like testing tools
    customFormat: {
        'name': '',
        'version': '',
        'description': '',
        'repository': '',
        'publisher': '',
        'author': '',
        'email': '',
        'url': '',
        'licenses': '',
        'licenseFile': ''
    }
}, function(err, packages) {
    if (err) {
        console.error('Error scanning licenses:', err);
        process.exit(1);
    } else {
        // Read the license file text for each dependency and inline it
        const formattedPackages = Object.keys(packages).map(pkgName => {
            const pkg = packages[pkgName];
            let licenseText = pkg.licenses; // Default fallback

            if (pkg.licenseFile && fs.existsSync(pkg.licenseFile)) {
                try {
                    licenseText = fs.readFileSync(pkg.licenseFile, 'utf8');
                } catch (e) {
                    console.warn(`Could not read license file for ${pkgName}`);
                }
            }

            return {
                name: pkg.name,
                version: pkg.version,
                licenseType: pkg.licenses,
                repository: pkg.repository,
                publisher: pkg.publisher || pkg.email || pkg.author || '', //'Unknown',
                licenseText: licenseText
            };
        });

        var licensFilePathExist = fs.existsSync(outputPathFolder);
        if(!licensFilePathExist){
            fs.mkdirSync(outputPathFolder, { recursive: true });
        }

        // Write to your frontend asset directory
        fs.writeFileSync(outputPath, JSON.stringify(formattedPackages, null, 2));
        console.log(`Successfully generated license report at: ${outputPath}`);
    }

    // use command "npm run licenses:generate"
});
