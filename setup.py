from setuptools import setup

def readme():
    with open('README.rst') as f:
        return f.read()

setup(name='dynamic_map',
      version='0.1',
      description='Creating interactive map for US Country..',
      long_description=readme(),
      url='http://github.com/dynamic_map',
      author='Application Nexus',
      author_email='demo@example.com',
      license='MIT',
      packages=['dynamic_map'],
      zip_safe=False)
