import setuptools

with open("README.md", "r") as fh:
    long_description = fh.read()

setuptools.setup(
    name="weather-wizard",
    version="0.0.1",
    author="Victor Torres",
    author_email="talk@victortorr.es",
    description="Single Page Application which shows the overall weather over a given country at current time",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/vhte/weather-wizard",
    packages=setuptools.find_packages(),
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: GNU GENERAL PUBLIC LICENSE",
        "Operating System :: OS Independent",
    ],
    install_requires=['datetime', 'pytest', 'requests', 'untangle'],
    python_requires='>=3.6',
)
