from setuptools import setup, find_packages

setup(
    name="quantum-studio",
    version="1.0.0",
    description="Professional Quantum Computing Engineering Workstation & Simulation Engine in Python",
    author="Quantum Studio",
    packages=find_packages(),
    python_requires=">=3.8",
    install_requires=[],
    extras_require={
        "qiskit": ["qiskit>=1.0.0", "qiskit-aer>=0.14.0"],
        "cirq": ["cirq>=1.3.0"],
        "scipy": ["numpy>=1.22.0", "scipy>=1.8.0"]
    },
    entry_points={
        "console_scripts": [
            "quantum-studio=main:main",
        ],
    },
    classifiers=[
        "Programming Language :: Python :: 3",
        "Topic :: Scientific/Engineering :: Physics",
        "Intended Audience :: Science/Research",
    ],
)
